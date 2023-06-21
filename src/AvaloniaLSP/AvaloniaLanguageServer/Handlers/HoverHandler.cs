namespace AvaloniaLanguageServer.Handlers;

public sealed class HoverHandler: HoverHandlerBase
{
    protected override HoverRegistrationOptions CreateRegistrationOptions(HoverCapability capability, 
        ClientCapabilities clientCapabilities)
    {
        return new()
        {
            DocumentSelector = _documentSelector
        };
    }

    public override Task<Hover?> Handle(HoverParams request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Inside HoverHandler: {Request}", request);
        
        var hover = new Hover
        {
            Contents = new MarkedStringsOrMarkupContent (
                new MarkupContent
                {
                    Kind = MarkupKind.Markdown,
                    Value = $"# {DateTime.Now}"
                })
        };
        return Task.FromResult<Hover?>(hover);
    }

    public HoverHandler(DocumentSelector documentSelector, ILogger<HoverHandler> logger)
    {
        _documentSelector = documentSelector;
        _logger = logger;
    }
    
    readonly DocumentSelector _documentSelector;
    private readonly ILogger<HoverHandler> _logger;
}
