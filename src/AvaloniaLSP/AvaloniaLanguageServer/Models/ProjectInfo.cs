using AvaloniaLanguageServer.Utilities;

namespace AvaloniaLanguageServer.Models;

public class ProjectInfo
{
    public static ProjectInfo? GetProjectInfo(DocumentUri uri)
    {
        string path = Utils.FromUri(uri);
        string root = Directory.GetDirectoryRoot(path);
        string? current = Path.GetDirectoryName(path);

        if (!File.Exists(path) || current == null)
            return null;

        var files = Array.Empty<FileInfo>();

        while (root!=current && files.Length == 0)
        {
            var directory = new DirectoryInfo(current);
            files = directory.GetFiles("*.csproj", SearchOption.TopDirectoryOnly);

            if (files.Length == 0)
                break;
            
            current = Path.GetDirectoryName(current);
        }

        return files.Length == 0 ? null : new ProjectInfo(current);
    }

    public ProjectInfo(string projectPath)
    {
        ProjectPath = projectPath;
    }
    
    public string ProjectPath { get; }
}