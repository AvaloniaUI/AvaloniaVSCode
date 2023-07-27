
using Avalonia.Ide.CompletionEngine;
using Avalonia.Ide.CompletionEngine.AssemblyMetadata;
using Avalonia.Ide.CompletionEngine.DnlibMetadataProvider;
using AvaloniaLanguageServer.Services;


namespace AvaloniaLanguageServer.Models;

public class Workspace
{
    public Workspace()
    {
        _metadataReader = new MetadataReader(new DnlibMetadataProvider());
    }
    
    public ProjectInfo? ProjectInfo { get; private set; }
    public BufferService BufferService { get; } = new BufferService();

    public async Task InitializeAsync(DocumentUri uri)
    {
        ProjectInfo = await ProjectInfo.GetProjectInfoAsync(uri);
        CompletionMetadata = await Task.Run(() => _metadataReader.GetForTargetAssembly(ProjectInfo!.AssemblyPath())); 
    }

    public Metadata? CompletionMetadata { get; private set; }
    readonly MetadataReader _metadataReader;
}