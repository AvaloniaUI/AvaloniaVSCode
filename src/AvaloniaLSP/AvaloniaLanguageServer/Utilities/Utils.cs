using OmniSharp.Extensions.LanguageServer.Protocol;

namespace AvaloniaLanguageServer.Utilities;

public static class Utils
{
    public static DocumentUri ToUri(string fileName) => DocumentUri.File(fileName);
    public static string FromUri(DocumentUri uri) => uri.GetFileSystemPath()
        .Replace(Path.AltDirectorySeparatorChar, Path.DirectorySeparatorChar);
    
    public static void FireAndForget(this Task task)
    {
        _ = task.ContinueWith(t =>
        {
            if (t.IsFaulted)
            {
                Log.Error(t.Exception, "Exception caught by FireAndForget");
            }
        }, TaskScheduler.Default);
    }
}