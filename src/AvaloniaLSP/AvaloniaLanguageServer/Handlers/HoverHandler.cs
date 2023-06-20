using OmniSharp.Extensions.LanguageServer.Protocol.Client.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Document;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;

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

    public HoverHandler(DocumentSelector documentSelector)
    {
        _documentSelector = documentSelector;
    }
    
    readonly DocumentSelector _documentSelector;
}
