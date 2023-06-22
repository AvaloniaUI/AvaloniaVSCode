using AvaloniaLanguageServer.Models;

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
            await _workspace.InitializeAsync(request.TextDocument.Uri);
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

        return hover;
    }

    public HoverHandler(Workspace workspace, DocumentSelector documentSelector, ILogger<HoverHandler> logger)
    {
        _workspace = workspace;
        _documentSelector = documentSelector;
        _logger = logger;
    }

    readonly DocumentSelector _documentSelector;
    readonly ILogger<HoverHandler> _logger;
    readonly Workspace _workspace;
}
