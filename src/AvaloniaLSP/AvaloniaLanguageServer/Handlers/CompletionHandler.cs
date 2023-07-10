using Avalonia.Ide.CompletionEngine;
using Avalonia.Ide.CompletionEngine.AssemblyMetadata;
using Avalonia.Ide.CompletionEngine.DnlibMetadataProvider;
using AvaloniaLanguageServer.Models;

namespace AvaloniaLanguageServer.Handlers;

public class CompletionHandler : CompletionHandlerBase
{

    public override Task<CompletionItem> Handle(CompletionItem request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("** Completion Item Handler {Request}", request);
        return Task.FromResult(request);
    }

    public override async Task<CompletionList> Handle(CompletionParams request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("** Inside CompletionHandler: {Request}", request);

        string? text = _workspace.BufferService.GetTextTillPosition(request.TextDocument.Uri, request.Position);
        if (text == null)
            return new CompletionList();

        var metadata = await InitializeCompletionEngineAsync(request.TextDocument.Uri);
        if (metadata == null)
        {
            return new CompletionList(new[]
            {
                new CompletionItem
                {
                    Label = "Build the project",
                    Documentation = new StringOrMarkupContent("You must build project to populate auto-complete items"),
                    Kind = CompletionItemKind.Unit
                }
            });
        }


        var set = _completionEngine.GetCompletions(metadata!, text, text.Length);

        _logger.LogInformation("** COMPLETION SET COUNT: {Set}", set?.Completions.Count);

        var completions = set?.
            Completions
            .Where(p => !p.DisplayText.Contains('`'))
            .Select(p => new CompletionItem
            {
                Label = p.DisplayText,
                Detail = p.Description,
                InsertText = p.InsertText,
                Kind = GetCompletionItemKind(p.Kind)

            });


        if (completions == null)
            return new CompletionList(true);

        return new CompletionList(completions);
    }

    protected override CompletionRegistrationOptions CreateRegistrationOptions
        (CompletionCapability capability, ClientCapabilities clientCapabilities)
    {
        return new()
        {
            DocumentSelector = _documentSelector,
            TriggerCharacters = new Container<string>("\'", "\"", " ", "<", ".", "[", "(", "#", "|", "/", "{"),
            AllCommitCharacters = new Container<string>("\n")
        };
    }

    async Task<Metadata?> InitializeCompletionEngineAsync(DocumentUri uri)
    {
        if (_workspace.ProjectInfo == null)
        {
            await _workspace.InitializeAsync(uri);
        }

        if (!_workspace.ProjectInfo!.IsAssemblyExist)
            return null;

        string assemblyPath = _workspace.ProjectInfo!.AssemblyPath;
        _logger.LogCritical("** Assembly Path: {Assembly}", assemblyPath);

        var metaDataLoad = await Task.Run(() => _metadataReader.GetForTargetAssembly(assemblyPath));
        return metaDataLoad;
    }

    public CompletionHandler(Workspace workspace, DocumentSelector documentSelector, ILogger<CompletionHandler> logger)
    {
        _workspace = workspace;
        _documentSelector = documentSelector;
        _logger = logger;

        _completionEngine = new CompletionEngine();
        _metadataReader = new MetadataReader(new DnlibMetadataProvider());
    }

    static CompletionItemKind GetCompletionItemKind(CompletionKind completionKind)
    {
        string name = Enum.GetName(completionKind) ?? string.Empty;

        var result = name switch
        {
            _ when name.Contains("Property") => CompletionItemKind.Property,
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
    readonly ILogger<CompletionHandler> _logger;

    readonly CompletionEngine _completionEngine;
    readonly MetadataReader _metadataReader;
}
