namespace AvaloniaLanguageServer.Services;

public sealed class Buffer
{

    public string? GetTextTillLine(Position position)
    {
        string[] lines = _text.Split(separator, StringSplitOptions.RemoveEmptyEntries);
        var linesRange = string.Join(string.Empty, lines[0..position.Line]);
        string lastLine = lines[position.Line];

        return linesRange + lastLine.Substring(0, position.Character);
    }

    public string? GetLine(Position position)
    {
        string[] lines = _text.Split(separator, StringSplitOptions.RemoveEmptyEntries);
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