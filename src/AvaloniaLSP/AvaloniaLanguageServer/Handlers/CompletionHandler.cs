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

        string? text = _workspace.BufferService.GetLine(request.TextDocument.Uri, request.Position);
        if (text == null)
        {
            return new CompletionList();
        }


        var metadata = await InitializeCompletionEngineAsync(request.TextDocument.Uri);
        var set = _completionEngine.GetCompletions(metadata!, text, request.Position.Character);

        _logger.LogInformation("** COMPLETION SET COUNT: {Set}", set?.Completions.Count);

        var completions = set?.
            Completions.Select(p => new CompletionItem
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
            TriggerCharacters = new Container<string>("\'", "\"", " ", "<", ".", "[", "(", "#", "|", "/"),
            AllCommitCharacters = new Container<string>("\n")
        };
    }

    async Task<Metadata?> InitializeCompletionEngineAsync(DocumentUri uri)
    {
        if (_workspace.ProjectInfo == null)
        {
            await _workspace.InitializeAsync(uri);
        }

        string assemblyPath = Path.Combine(_workspace.ProjectInfo!.ProjectDirectory, "bin/Debug/net6.0/TestApp.dll");
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
        bool success = Enum.TryParse(Enum.GetName(completionKind), out CompletionItemKind kind);
        return success ? kind : CompletionItemKind.Text;
    }

    readonly Workspace _workspace;
    readonly DocumentSelector _documentSelector;
    readonly ILogger<CompletionHandler> _logger;

    readonly CompletionEngine _completionEngine;
    readonly MetadataReader _metadataReader;
}
