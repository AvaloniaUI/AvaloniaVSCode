
using System.Text.Json;
using Avalonia.Ide.CompletionEngine;
using Avalonia.Ide.CompletionEngine.AssemblyMetadata;
using Avalonia.Ide.CompletionEngine.DnlibMetadataProvider;
using AvaloniaLanguageServer.Services;


namespace AvaloniaLanguageServer.Models;

public class Workspace
{
    public ProjectInfo? ProjectInfo { get; private set; }
    public BufferService BufferService { get; } = new();

    public async Task InitializeAsync(DocumentUri uri, string? RootPath)
    {
        try
        {
            ProjectInfo = await ProjectInfo.GetProjectInfoAsync(uri);
            CompletionMetadata = BuildCompletionMetadata(RootPath);
        }
        catch (Exception e)
        {
            throw new Exception($"Failed to initialize workspace: {uri}", e);
        }
    }

    Metadata? BuildCompletionMetadata(string? RootPath)
    {
        if (RootPath == null)
            return null;

        var slnFile = SolutionName(RootPath) ?? Path.GetFileNameWithoutExtension(RootPath);

        if (slnFile == null)
            return null;


        var slnFilePath = Path.Combine(Path.GetTempPath(), $"{slnFile}.json");

        if (!File.Exists(slnFilePath))
            return null;

        string content = File.ReadAllText(slnFilePath);
        var package = JsonSerializer.Deserialize<SolutionData>(content);
        var exeProj = package!.GetExecutableProject();

        return _metadataReader.GetForTargetAssembly(exeProj?.TargetPath ?? "");
    }

    string? SolutionName(string RootPath)
    {
        var slnFiles = Directory.EnumerateFiles(RootPath, "*.sln", SearchOption.AllDirectories);
        foreach (string slnFile in slnFiles)
        {
            return Path.GetFileName(slnFile);
        }
        return null;
    }

    public Metadata? CompletionMetadata { get; private set; }
    readonly MetadataReader _metadataReader = new(new DnlibMetadataProvider());
}