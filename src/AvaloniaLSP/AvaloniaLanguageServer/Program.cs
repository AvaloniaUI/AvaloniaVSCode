using AvaloniaLanguageServer.Handlers;
using AvaloniaLanguageServer.Models;
using OmniSharp.Extensions.LanguageServer.Protocol.Server;

namespace AvaloniaLanguageServer;

public class Program
{
    static ILanguageServer server;
    public static async Task Main(string[] args)
    {
        InitializeLogging();
        server = await LanguageServer.From(ConfigureOptions);

        Log.Logger.Information("Language server initialised");
        await server.WaitForExit;
    }

    static void ConfigureOptions(LanguageServerOptions options)
    {
        options
            .WithInput(Console.OpenStandardInput())
            .WithOutput(Console.OpenStandardOutput())
            .ConfigureLogging(p => p
                .AddSerilog(Log.Logger)
                .AddLanguageProtocolLogging()
                .SetMinimumLevel(LogLevel.Trace)
            )
            .WithHandler<CompletionHandler>()
            .WithHandler<TextDocumentSyncHandler>()
            .WithServices(ConfigureServices);
    }

    static void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton(new ConfigurationItem { Section = "Avalonia Server" });
        services.AddSingleton(new DocumentSelector(
            new DocumentFilter { Pattern = "**/*.axaml" }
        ));
        services.AddSingleton<Workspace>();
        services.AddSingleton(GetServer);
    }

    static ILanguageServer GetServer() => server;

    static void InitializeLogging()
    {
        string logFilePath = Path.Combine(Path.GetTempPath(), "avalonia.log");
        Log.Logger = new LoggerConfiguration()
            .WriteTo.File(logFilePath)
            .Enrich.FromLogContext()
            .MinimumLevel.Verbose()
            .CreateLogger();
    }
}