using AvaloniaLanguageServer.Handlers;

namespace AvaloniaLanguageServer;

public class Program
{
    public static async Task Main(string[] args)
    {
        InitializeLogging();
        var server = await LanguageServer.From(ConfigureOptions);

        Log.Logger.Information("Language server initialised");
        await server.WaitForExit;
    }

    static void ConfigureOptions(LanguageServerOptions options)
    {
        options
            .WithInput(Console.OpenStandardInput())
            .WithOutput(Console.OpenStandardOutput())
            .ConfigureLogging(
                b => b.AddSerilog(Log.Logger)
                .AddLanguageProtocolLogging()
                .SetMinimumLevel(LogLevel.Trace))
            .WithHandler<HoverHandler>()
            .WithHandler<CompletionHandler>()
            .WithServices(ConfigureServices);
    }

    static void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton(new ConfigurationItem { Section = "Avalonia Server" });
        services.AddSingleton(new DocumentSelector(
            new DocumentFilter { Pattern = "**/*.axaml" }
        ));
    }

    static void InitializeLogging()
    {
        const string format = "{Timestamp:HH:mm:ss.fff} [{Level}] {Pid} {Message}{NewLine}{Exception}";
        Log.Logger = new LoggerConfiguration()
            .Enrich.FromLogContext()
            .WriteTo.File("/Users/prashantvc/avaloniaServer.log", rollingInterval: RollingInterval.Hour, outputTemplate: format)
            .MinimumLevel.Verbose()
            .CreateLogger();
    }
}