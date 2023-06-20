using AvaloniaLanguageServer.Handlers;
using Microsoft.Extensions.DependencyInjection;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Server;

namespace AvaloniaLanguageServer;

public class Program
{
    public static async Task Main(string[] args)
    {
        var server = await LanguageServer.From(ConfigureOptions);
        await server.WaitForExit;
    }

    static void ConfigureOptions(LanguageServerOptions options)
    {
        options
            .WithInput(Console.OpenStandardInput())
            .WithOutput(Console.OpenStandardOutput())
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
}