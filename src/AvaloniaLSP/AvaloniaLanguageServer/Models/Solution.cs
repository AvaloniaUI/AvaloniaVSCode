using System.Text.Json.Serialization;
namespace AvaloniaLanguageServer.Models
{
    public partial class SolutionData
    {
        [JsonPropertyName("solution")]
        public string Solution { get; set; }

        [JsonPropertyName("projects")]
        public Project[] Projects { get; set; }

        [JsonPropertyName("files")]
        public ProjectFile[] Files { get; set; }

        public Project? GetExecutableProject()
        {
            return Projects.FirstOrDefault(project => project.OutputType == "WinExe");
        }
    }

    public partial class ProjectFile
    {
        [JsonPropertyName("path")]
        public string Path { get; set; }

        [JsonPropertyName("targetPath")]
        public string TargetPath { get; set; }

        [JsonPropertyName("projectPath")]
        public string ProjectPath { get; set; }
    }

    public partial class Project
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("path")]
        public string Path { get; set; }

        [JsonPropertyName("targetPath")]
        public string TargetPath { get; set; }

        [JsonPropertyName("outputType")]
        public string OutputType { get; set; }

        [JsonPropertyName("designerHostPath")]
        public string DesignerHostPath { get; set; }

        [JsonPropertyName("targetFramework")]
        public string TargetFramework { get; set; }

        [JsonPropertyName("depsFilePath")]
        public string DepsFilePath { get; set; }

        [JsonPropertyName("runtimeConfigFilePath")]
        public string RuntimeConfigFilePath { get; set; }

        [JsonPropertyName("projectReferences")]
        public string[] ProjectReferences { get; set; }

        [JsonPropertyName("directoryPath")]
        public string DirectoryPath { get; set; }


        [JsonPropertyName("intermediateOutputPath")]
        public string IntermediateOutputPath { get; set; }
    }

}