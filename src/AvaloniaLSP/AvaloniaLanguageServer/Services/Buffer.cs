using System.Text;

namespace AvaloniaLanguageServer.Services;

public sealed class Buffer
{

    public string? GetTextTillLine(Position position)
    {
        string[] lines = _text.Split(NewLine);
        var lineRange = lines[0..position.Line];
        return string.Join(NewLine, lineRange);
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
    const string NewLine = "\n";
}