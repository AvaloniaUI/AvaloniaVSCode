namespace AvaloniaLanguageServer.Services;

public sealed class Buffer
{

    public string? GetTextTillLine(Position position)
    {
        string[] lines = _text.Split(separator, StringSplitOptions.None);
        string text = string.Join("\n", lines[..position.Line]);
        string line = lines[position.Line][..position.Character];
        return $"{text}\n{line}";
    }

    public string? GetLine(Position position)
    {
        string[] lines = _text.Split(separator, StringSplitOptions.None);
        return lines[position.Line];
    }

    public string GetText() => _text;

    public Buffer(string text)
    {
        _text = text;
    }

    readonly string _text;
    private static readonly string[] separator = ["\n", "\r\n"];
}
