using System.Xml.Linq;
using AvaloniaLanguageServer.Utilities;

namespace AvaloniaLanguageServer.Models;

public class ProjectInfo
{
    public static async Task<ProjectInfo?> GetProjectInfoAsync(DocumentUri uri)
    {
        string path = Utils.FromUri(uri);
        string root = Directory.GetDirectoryRoot(path);
        string? current = Path.GetDirectoryName(path);

        if (!File.Exists(path) || current == null)
            return null;

        var files = Array.Empty<FileInfo>();
        var info = await Task.Run(() =>
        {
            while (root != current && files.Length == 0)
            {
                var directory = new DirectoryInfo(current!);
                files = directory.GetFiles("*.csproj", SearchOption.TopDirectoryOnly);
                files = files.Concat(directory.GetFiles("*.fsproj", SearchOption.TopDirectoryOnly)).ToArray();
                if (files.Length != 0)
                    break;

                current = Path.GetDirectoryName(current);
            }

            return files.Length != 0 ? new ProjectInfo(files.FirstOrDefault()?.FullName, current) : null;
        });

        return info;
    }

    ProjectInfo(string? projectPath, string? projectDirectory)
    {
        ProjectPath = projectPath ?? throw new ArgumentNullException(nameof(projectPath));
        ProjectDirectory = projectDirectory ?? throw new ArgumentNullException(nameof(projectDirectory));
    }

    /// <summary>
    /// Returns full project path
    /// </summary>
    public string ProjectPath { get; }

    /// <summary>
    /// Project directory path
    /// </summary>
    public string ProjectDirectory { get; }

    public string AssemblyPath()
    {
        string? path = string.Empty;

        XDocument project = XDocument.Load(ProjectPath);
        XElement? outDirElement = project.Descendants("PropertyGroup").Descendants("OutDir").FirstOrDefault();
        string outDir = outDirElement?.Value ?? Path.Combine("bin", "Debug");
        string debugPath = Path.Combine(ProjectDirectory, outDir);

        XElement? assemblyNameElement = project.Descendants("PropertyGroup").Descendants("AssemblyName").FirstOrDefault();
        string assemblyName = assemblyNameElement?.Value ?? Path.GetFileNameWithoutExtension(ProjectPath);

        if (Directory.Exists(debugPath))
        {
            path = Directory.GetFiles(debugPath, assemblyName + ".dll", SearchOption.AllDirectories).FirstOrDefault();
        }

        return path ?? string.Empty;
    }

    public bool IsAssemblyExist
    {
        get
        {
            string assemblyPath = AssemblyPath();
            return !string.IsNullOrEmpty(assemblyPath) && File.Exists(assemblyPath);
        }
    }

}
