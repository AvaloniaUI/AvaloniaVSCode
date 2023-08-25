
using System.Text.Json;
using Avalonia.Ide.CompletionEngine;
using Avalonia.Ide.CompletionEngine.AssemblyMetadata;
using Avalonia.Ide.CompletionEngine.DnlibMetadataProvider;
using AvaloniaLanguageServer.Services;
using AvaloniaLanguageServer.Utilities;


namespace AvaloniaLanguageServer.Models;

public class Workspace
{
    public ProjectInfo? ProjectInfo { get; private set; }
    public BufferService BufferService { get; } = new();

    public async Task InitializeAsync(DocumentUri uri)
    {
        ProjectInfo = await ProjectInfo.GetProjectInfoAsync(uri);
        CompletionMetadata = BuildCompletionMetadata(uri);
    }

    Metadata? BuildCompletionMetadata(DocumentUri uri)
    {
        var slnFile = SolutionName(uri) ?? Path.GetFileNameWithoutExtension(ProjectInfo?.ProjectDirectory);

        if (slnFile == null)
            return null;

        
        var slnFilePath = Path.Combine(Path.GetTempPath(), $"{slnFile}.json");

        if (!File.Exists(slnFilePath))
            return null;
        
        string content = File.ReadAllText(slnFilePath);
        var package = JsonSerializer.Deserialize<SolutionData>(content);
        var exeProj = package!.GetExecutableProject();
        
        return _metadataReader.GetForTargetAssembly(exeProj?.TargetPath??"");
    }

    string? SolutionName(DocumentUri uri)
    {
        string path = Utils.FromUri(uri);
        string root = Directory.GetDirectoryRoot(path);
        string? current = Path.GetDirectoryName(path);

        if (!File.Exists(path) || current == null)
            return null;

        var files = Array.Empty<FileInfo>();
    
        while (root != current && files.Length == 0)
        {
            var directory = new DirectoryInfo(current!);
            files = directory.GetFiles("*.sln", SearchOption.TopDirectoryOnly);

            if (files.Length != 0)
                break;

            current = Path.GetDirectoryName(current);
        }

        return files.FirstOrDefault()?.Name;
    }

    public Metadata? CompletionMetadata { get; private set; }
    readonly MetadataReader _metadataReader = new(new DnlibMetadataProvider());
}