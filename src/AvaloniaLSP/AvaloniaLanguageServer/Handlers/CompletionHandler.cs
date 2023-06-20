using OmniSharp.Extensions.LanguageServer.Protocol.Client.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Document;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;

namespace AvaloniaLanguageServer.Handlers;

public class CompletionHandler: CompletionHandlerBase
{


    public override Task<CompletionItem> Handle(CompletionItem request, CancellationToken cancellationToken)
    {
        return Task.FromResult(request);
    }

    public override Task<CompletionList> Handle(CompletionParams request, CancellationToken cancellationToken)
    {
        var completions = new List<CompletionItem>
        {
            new()
            {
                Label = "Hello",
                Kind = CompletionItemKind.Text,
                Detail = "Hello World",
                Documentation = "Hello World",
                InsertText = "Hello World",
            },
            new()
            {
                Label = "Hola",
                Kind = CompletionItemKind.Event,
                Detail = "This Hola from Spain",
                Documentation = "Look up the documentation",
                InsertText = "Hola Indo",
            }
        };

        return Task.FromResult(new CompletionList(completions, isIncomplete: false));
    }

    protected override CompletionRegistrationOptions CreateRegistrationOptions(CompletionCapability capability, ClientCapabilities clientCapabilities)
    {
        return new()
        {
            DocumentSelector = _documentSelector,
            ResolveProvider = true,
            TriggerCharacters = new Container<string>(".", ":", "<", ">", "/", "\\"),
            AllCommitCharacters = new Container<string>("\n")

        };
    }

    public CompletionHandler(DocumentSelector documentSelector)
    {
        _documentSelector = documentSelector;
    }
    readonly DocumentSelector _documentSelector;
}
