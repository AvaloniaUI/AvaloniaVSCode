

namespace AvaloniaLanguageServer.Models;

public class Workspace
{
    public ProjectInfo? ProjectInfo { get; private set; }

    public async Task InitializeAsync(DocumentUri uri)
    {
        ProjectInfo = await ProjectInfo.GetProjectInfoAsync(uri);
    }
}