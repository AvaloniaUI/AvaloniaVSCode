

namespace AvaloniaLanguageServer.Models;

public class Workspace
{
    public ProjectInfo? ProjectInfo { get; private set; }

    public void Initialize(DocumentUri uri)
    {
        ProjectInfo = ProjectInfo.GetProjectInfo(uri);
    }
}