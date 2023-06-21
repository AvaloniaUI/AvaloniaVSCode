using OmniSharp.Extensions.LanguageServer.Protocol;

namespace AvaloniaLanguageServer.Utilities;

public static class Utils
{
    public static DocumentUri ToUri(string fileName) => DocumentUri.File(fileName);
    public static string FromUri(DocumentUri uri) => uri.GetFileSystemPath()
        .Replace(Path.AltDirectorySeparatorChar, Path.DirectorySeparatorChar);
}