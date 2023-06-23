using AvaloniaLanguageServer.Models;
using MediatR;
using Microsoft.Extensions.Configuration;
using OmniSharp.Extensions.LanguageServer.Protocol.Server;
using OmniSharp.Extensions.LanguageServer.Protocol.Server.Capabilities;

namespace AvaloniaLanguageServer.Handlers;

public class TextDocumentSyncHandler: TextDocumentSyncHandlerBase
{
    private readonly ILogger<TextDocumentSyncHandler> _logger;
    private readonly ILanguageServerConfiguration _configuration;
    private readonly DocumentSelector _documentSelector;
    private readonly Workspace _workspace;
    

    public override async Task<Unit> Handle(DidOpenTextDocumentParams request, CancellationToken cancellationToken)
    {
        var uri = request.TextDocument.Uri;

        var conf = await _configuration.GetScopedConfiguration(uri, cancellationToken);
        var options = new ServerOptions();
        
        conf.GetSection("Avalonia").Bind(options);

        string text = request.TextDocument.Text;
        await _workspace.InitializeAsync(uri);
        _workspace.BufferService.Add(uri, text);
        
        _logger.LogInformation("** DidOpenText: {Uri}", uri);

        return Unit.Value;
    }

    public override Task<Unit> Handle(DidChangeTextDocumentParams request, CancellationToken cancellationToken)
    {
        var uri = request.TextDocument.Uri;
        foreach (var change in request.ContentChanges)
        {
            if (change.Range != null)
            {
                _workspace.BufferService.ApplyIncrementalChange(uri, change.Range, change.Text);
            }
            else
            {
                _workspace.BufferService.ApplyFullChange(uri, change.Text);
            }
        }

        return Task.FromResult(Unit.Value);
    }

    public override Task<Unit> Handle(DidSaveTextDocumentParams request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("DidSaveTextDocumentParams {Request}", request);
        return Unit.Task;
    }

    public override Task<Unit> Handle(DidCloseTextDocumentParams request, CancellationToken cancellationToken)
    {
        
        if (_configuration.TryGetScopedConfiguration(request.TextDocument.Uri, out var disposable))
            disposable.Dispose();

        var uri = request.TextDocument.Uri;
        _workspace.BufferService.Remove(uri);
        
        _logger.LogInformation("** Did Close Doc: {Uri}", uri);

        return Task.FromResult(Unit.Value);
    }

    protected override TextDocumentSyncRegistrationOptions CreateRegistrationOptions(SynchronizationCapability capability,
        ClientCapabilities clientCapabilities)
    {
        return new TextDocumentSyncRegistrationOptions
        {
            DocumentSelector = _documentSelector,
            Change = TextDocumentSyncKind.Incremental,
            Save = new SaveOptions {IncludeText = false}
        };
    }
    
    public override TextDocumentAttributes GetTextDocumentAttributes(DocumentUri uri)
    {
        return new TextDocumentAttributes(uri, uri.Scheme!, "axaml");
    }
    
    public TextDocumentSyncHandler(
        ILogger<TextDocumentSyncHandler> logger, 
        ILanguageServerConfiguration configuration,
        DocumentSelector documentSelector,
        Workspace workspace)
    {
        _logger = logger;
        _configuration = configuration;
        _documentSelector = documentSelector;
        _workspace = workspace;
    }
    
    public class ServerOptions
    {
        public bool CompletionWord { get; set; }
    }
}