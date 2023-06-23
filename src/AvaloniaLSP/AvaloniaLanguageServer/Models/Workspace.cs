

using AvaloniaLanguageServer.Services;

namespace AvaloniaLanguageServer.Models;

public class Workspace
{
    public ProjectInfo? ProjectInfo { get; private set; }
    public BufferService BufferService { get; } = new BufferService();

    public async Task InitializeAsync(DocumentUri uri)
    {
        ProjectInfo = await ProjectInfo.GetProjectInfoAsync(uri);
    }
}