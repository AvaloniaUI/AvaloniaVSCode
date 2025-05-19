using AvaloniaLanguageServer.Models;
using OmniSharp.Extensions.LanguageServer.Protocol.Server;

namespace AvaloniaLanguageServer.Handlers;

public sealed class HoverHandler : HoverHandlerBase
{
    protected override HoverRegistrationOptions CreateRegistrationOptions(HoverCapability capability,
        ClientCapabilities clientCapabilities)
    {
        _logger.LogInformation("Hover handlers: {Workspace}",
            clientCapabilities.Workspace);

        return new()
        {
            DocumentSelector = _documentSelector
        };
    }

    public override async Task<Hover?> Handle(HoverParams request, CancellationToken cancellationToken)
    {
        if (_workspace.ProjectInfo == null)
        {
            await _workspace.InitializeAsync(request.TextDocument.Uri, _getServer()?.Client.ClientSettings.RootPath);
        }

        var hover = new Hover
        {
            Contents = new MarkedStringsOrMarkupContent(
                new MarkupContent
                {
                    Kind = MarkupKind.Markdown,
                    Value = $"# {DateTime.Now}"
                })
        };

        var server = _getServer();
        _logger.LogInformation("*** Server: {Server}", server?.Client.ClientSettings.RootPath);

        return hover;
    }

    public HoverHandler(Workspace workspace, DocumentSelector documentSelector, ILogger<HoverHandler> logger
    , Func<ILanguageServer?> getServer)
    {
        _workspace = workspace;
        _documentSelector = documentSelector;
        _logger = logger;
        _getServer = getServer;
    }

    Func<ILanguageServer?> _getServer;

    readonly DocumentSelector _documentSelector;
    readonly ILogger<HoverHandler> _logger;
    readonly Workspace _workspace;
}
