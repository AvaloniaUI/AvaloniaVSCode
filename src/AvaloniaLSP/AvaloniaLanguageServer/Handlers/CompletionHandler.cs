using Avalonia.Ide.CompletionEngine;
using AvaloniaLanguageServer.Models;

namespace AvaloniaLanguageServer.Handlers;

public class CompletionHandler : CompletionHandlerBase
{
    public override Task<CompletionItem> Handle(CompletionItem request, CancellationToken cancellationToken)
    {
        if (!NeedResolve()) return Task.FromResult(request);
        
        var ci = new CompletionItem
        {
            Label = request.Label,
            Kind = request.Kind,
            InsertText = request.InsertText,
            Command = Command.Create("avalonia.InsertProperty", request.InsertText!)
        };

        return Task.FromResult(ci);

        bool NeedResolve()
        {
            return request.InsertText!.EndsWith(".") || request.InsertText!.EndsWith("\"");
        }
    }

    public override async Task<CompletionList> Handle(CompletionParams request, CancellationToken cancellationToken)
    {
        string? text = _workspace.BufferService.GetTextTillPosition(request.TextDocument.Uri, request.Position);
        if (text == null)
            return new CompletionList();

        _metadata ??= await InitializeCompletionEngineAsync(request.TextDocument.Uri);
        if (_metadata == null)
        {
            return new CompletionList(new[]
            {
                new CompletionItem
                {
                    Label = "Build the project",
                    Documentation = new StringOrMarkupContent("Build the project to enable code completion"),
                    Kind = CompletionItemKind.Event,
                    Command = Command.Create("avalonia.createPreviewerAssets"),
                    InsertText = " "
                }
            });
        }

        var set = _completionEngine.GetCompletions(_metadata!, text, text.Length);

        var completions = set?.Completions
            .Where(p => !p.DisplayText.Contains('`'))
            .Select(p => new CompletionItem
            {
                Label = p.DisplayText,
                Detail = p.Description,
                InsertText = p.InsertText,
                Kind = GetCompletionItemKind(p.Kind),
            });


        if (completions == null)
            return new CompletionList(true);

        return new CompletionList(completions, isIncomplete: false);
    }

    protected override CompletionRegistrationOptions CreateRegistrationOptions
        (CompletionCapability capability, ClientCapabilities clientCapabilities)
    {
        return new()
        {
            DocumentSelector = _documentSelector,
            TriggerCharacters = new Container<string>(_triggerChars),
            AllCommitCharacters = new Container<string>("\n"),
            ResolveProvider = true
        };
    }

    async Task<Metadata?> InitializeCompletionEngineAsync(DocumentUri uri)
    {
        if (_workspace.ProjectInfo == null || (_workspace.ProjectInfo.IsAssemblyExist 
                                               && _workspace.CompletionMetadata == null))
        {
            await _workspace.InitializeAsync(uri);
        }

        return _workspace.CompletionMetadata;
    }

    public CompletionHandler(Workspace workspace, DocumentSelector documentSelector, ILogger<CompletionHandler> logger)
    {
        _workspace = workspace;
        _documentSelector = documentSelector;

        _completionEngine = new CompletionEngine();
    }

    static CompletionItemKind GetCompletionItemKind(CompletionKind completionKind)
    {
        string name = Enum.GetName(completionKind) ?? string.Empty;

        var result = name switch
        {
            _ when name.Contains("Property") || name.Contains("AttachedProperty") => CompletionItemKind.Property,
            _ when name.Contains("Event") => CompletionItemKind.Event,
            _ when name.Contains("Namespace") || name.Contains("VS_XMLNS") => CompletionItemKind.Module,
            _ when name.Contains("MarkupExtension") => CompletionItemKind.Class,
            _ => GetRest(name)
        };

        return result;

        CompletionItemKind GetRest(string enumName)
        {
            bool success = Enum.TryParse(enumName, out CompletionItemKind kind);
            return success ? kind : CompletionItemKind.Text;
        }
    }

    readonly Workspace _workspace;
    readonly DocumentSelector _documentSelector;

    readonly CompletionEngine _completionEngine;
    Metadata? _metadata;

    readonly string[] _triggerChars = { "\'", "\"", " ", "<", ".", "[", "(", "#", "|", "/", "{" };
}
