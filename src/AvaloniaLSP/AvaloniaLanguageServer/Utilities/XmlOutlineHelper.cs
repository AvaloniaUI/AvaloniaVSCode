using System;
using System.Collections.Generic;
using Avalonia.Ide.CompletionEngine;

namespace AvaloniaLanguageServer.Utilities;

/// <summary>
/// Outline helper built on top of XmlParser's public surface (minimal additions: ElementNameStart, Step()).
/// Generates start/self-closing and closing tag events; skips comments / declarations / CDATA implicitly
/// because those regions never produce normal StartElement -> None cycles with IsInClosingTag relevant.
/// </summary>
internal static class XmlOutlineHelper
{
    public readonly record struct OutlineEvent(
        bool IsStart,
        bool IsSelfClosing,
        string TagName,
        int TagStart,
        int NameStart,
        int NameEnd,
        int TagEnd,
        bool IsClosing);

    public static IEnumerable<OutlineEvent> Enumerate(string? text)
    {
        if (string.IsNullOrEmpty(text)) yield break;
        var parser = new XmlParser(text.AsMemory());

        int? currentTagStart = null;
        int nameStart = -1;
        bool isClosing = false;
        bool suppressed = false; // comment / declaration / cdata

        // Track previous state manually (not exposed), infer transitions via sentinel capture
        var prevState = parser.State;
        while (parser.ParseChar())
        {
            var state = parser.State;
            // Detect start tag boundary
            if (state == XmlParser.ParserState.StartElement && prevState != XmlParser.ParserState.StartElement)
            {
                currentTagStart = parser.ContainingTagStart; // start '<'
                nameStart = parser.ElementNameStart; // may contain '/' if closing
                isClosing = parser.IsInClosingTag;
                suppressed = false;
            }

            // Suppression detection: immediately after StartElement if we enter special regions
            if (!suppressed && currentTagStart.HasValue && prevState == XmlParser.ParserState.StartElement &&
                (state == XmlParser.ParserState.InsideComment || state == XmlParser.ParserState.InsideDeclaration || state == XmlParser.ParserState.InsideCdata))
            {
                suppressed = true;
            }

            // Detect end of tag when returning to None
            if (state == XmlParser.ParserState.None && currentTagStart.HasValue)
            {
                int tagEnd = parser.ParserPos - 1; // '>' position
                if (isClosing)
                {
                    int closingNameStart = nameStart + 1; // skip '/'
                    int closingNameEnd = ScanNameTokenEnd(text, closingNameStart);
                    if (closingNameEnd > closingNameStart)
                    {
                        if (!suppressed)
                        {
                            string tagName = text.Substring(closingNameStart, closingNameEnd - closingNameStart);
                            yield return new OutlineEvent(false, false, tagName, currentTagStart.Value, closingNameStart, closingNameEnd, tagEnd, true);
                        }
                    }
                }
                else
                {
                    int startNameStart = nameStart;
                    int startNameEnd = GetNameEnd(parser, text, startNameStart);
                    if (!suppressed)
                    {
                        string tagName = text.Substring(startNameStart, startNameEnd - startNameStart);
                        bool selfClosing = startNameEnd <= tagEnd && tagEnd > startNameStart && tagEnd - 1 < text.Length && text[tagEnd - 1] == '/';
                        yield return new OutlineEvent(true, selfClosing, tagName, currentTagStart.Value, startNameStart, startNameEnd, tagEnd, false);
                    }
                }
                currentTagStart = null;
            }

            prevState = state;
        }
    }

    private static int GetNameEnd(XmlParser parser, string s, int start)
    {
        // If ElementNameEnd already known
        if (parser.ElementNameEnd.HasValue)
            return parser.ElementNameEnd.Value + 1;
        return ScanNameTokenEnd(s, start);
    }

    private static int ScanNameTokenEnd(string s, int start)
    {
        int i = start;
        while (i < s.Length)
        {
            char c = s[i];
            if (char.IsWhiteSpace(c) || c == '/' || c == '>') break;
            i++;
        }
        return i;
    }
}
