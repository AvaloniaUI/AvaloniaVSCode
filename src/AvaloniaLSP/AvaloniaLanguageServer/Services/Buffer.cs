using System.Text;

namespace AvaloniaLanguageServer.Services;

public sealed class Buffer
{

    public string? GetTextTillLine(Position position)
    {
        string[] lines = _text.Split(NewLine);
        var linesRange = string.Join(string.Empty, lines[0..position.Line]);
        string lastLine = lines[position.Line];

        string rangeText = linesRange.Replace(NewLine, string.Empty);
        return rangeText + lastLine.Substring(0, position.Character);
    }

    public string? GetLine(Position position)
    {
        string[] lines = _text.Split(NewLine);
        return lines[position.Line];
    }

    public string GetText() => _text;

    public Buffer(string text)
    {
        _text = text;
    }

    readonly string _text;
    string NewLine = Environment.NewLine;
}