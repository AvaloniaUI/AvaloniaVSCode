using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AvaloniaLanguageServer.Models;
using AvaloniaLanguageServer.Utilities;
using Microsoft.Extensions.Logging;
using OmniSharp.Extensions.LanguageServer.Protocol.Document;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Protocol.Server.Capabilities;

namespace AvaloniaLanguageServer.Handlers;

/// <summary>
/// Provides a hierarchical outline for .axaml documents using a lightweight tag parser.
/// </summary>
public class DocumentSymbolHandler : DocumentSymbolHandlerBase
{
    private readonly Workspace _workspace;
    private readonly DocumentSelector _documentSelector;
    private readonly ILogger<DocumentSymbolHandler> _logger;

    public DocumentSymbolHandler(Workspace workspace, DocumentSelector documentSelector, ILogger<DocumentSymbolHandler> logger)
    {
        _workspace = workspace;
        _documentSelector = documentSelector;
        _logger = logger;
    }

    protected override DocumentSymbolRegistrationOptions CreateRegistrationOptions(DocumentSymbolCapability capability, ClientCapabilities clientCapabilities)
    {
        return new DocumentSymbolRegistrationOptions
        {
            DocumentSelector = _documentSelector,
            Label = "Avalonia Document Symbols"
        };
    }

    public override Task<SymbolInformationOrDocumentSymbolContainer> Handle(DocumentSymbolParams request, CancellationToken cancellationToken)
    {
        var uri = request.TextDocument.Uri;
        var text = _workspace.BufferService.GetFullText(uri);
        if (text is null)
        {
            _logger.LogDebug("No buffer text for {Uri}", uri);
            return Task.FromResult(new SymbolInformationOrDocumentSymbolContainer());
        }
        var symbols = ParseDocumentSymbols(text);
        return Task.FromResult(new SymbolInformationOrDocumentSymbolContainer(symbols));
    }

    private IReadOnlyList<SymbolInformationOrDocumentSymbol> ParseDocumentSymbols(string text)
    {
        var lineStarts = BuildLineStartIndex(text);
        var roots = new List<Node>();
        var stack = new Stack<Node>();
        foreach (var ev in XmlOutlineHelper.Enumerate(text))
        {
            if (ev.IsStart)
            {
                if (string.IsNullOrWhiteSpace(ev.TagName))
                {
                    _logger.LogDebug("[DocSymbols] Skipping start tag with empty name at {Pos}", ev.TagStart);
                    continue;
                }
                var node = new Node
                {
                    TagName = ev.TagName,
                    Start = ev.TagStart,
                    NameTokenStart = ev.NameStart < 0 ? ev.TagStart : ev.NameStart,
                    NameTokenEnd = ev.NameEnd < 0 || ev.NameEnd < ev.NameStart ? (ev.NameStart < 0 ? ev.TagStart + ev.TagName.Length : ev.NameStart + ev.TagName.Length) : ev.NameEnd,
                    End = ev.TagEnd
                };
                if (ev.IsSelfClosing)
                    AttachNode(node, stack, roots);
                else
                    stack.Push(node);
            }
            else if (ev.IsClosing)
            {
                if (string.IsNullOrWhiteSpace(ev.TagName))
                {
                    _logger.LogDebug("[DocSymbols] Skipping closing tag with empty name at {Pos}", ev.TagStart);
                }
                while (stack.Count > 0)
                {
                    var node = stack.Pop();
                    node.End = ev.TagEnd;
                    AttachNode(node, stack, roots);
                    if (node.TagName == ev.TagName)
                        break;
                }
            }
        }
        while (stack.Count > 0)
            AttachNode(stack.Pop(), stack, roots);
        return roots.Select(r => (SymbolInformationOrDocumentSymbol)ToDocumentSymbol(r, lineStarts)).ToList();
    }

    private static void AttachNode(Node node, Stack<Node> stack, List<Node> roots)
    {
        if (stack.Count > 0) stack.Peek().Children.Add(node); else roots.Add(node);
    }

    private static List<int> BuildLineStartIndex(string text)
    {
        var list = new List<int> { 0 };
        for (int i = 0; i < text.Length; i++) if (text[i] == '\n') list.Add(i + 1);
        return list;
    }

    private static Position ToPosition(int index, List<int> lineStarts)
    {
        int line = lineStarts.BinarySearch(index);
        if (line < 0)
        {
            line = ~line - 1;
        }
        int character = index - lineStarts[line];
        return new Position(line, character);
    }

    private static DocumentSymbol ToDocumentSymbol(Node node, List<int> lineStarts)
    {
        var startPos = ToPosition(node.Start, lineStarts);
        var endPos = ToPosition(node.End, lineStarts);
        var selStart = ToPosition(node.NameTokenStart, lineStarts);
        var selEnd = ToPosition(node.NameTokenEnd, lineStarts);

        var kind = GuessKind(node.TagName);
        string displayName = node.TagName;
        string? detail = null;
        if (kind == SymbolKind.Property && node.TagName.Contains('.'))
        {
            var idx = node.TagName.LastIndexOf('.');
            var typePart = node.TagName.Substring(0, idx);
            var propPart = node.TagName[(idx + 1)..];
            displayName = propPart;
            detail = typePart;
        }

        return new DocumentSymbol
        {
            Name = displayName,
            Kind = kind,
            Detail = detail,
            Range = new OmniSharp.Extensions.LanguageServer.Protocol.Models.Range
            {
                Start = startPos,
                End = endPos
            },
            SelectionRange = new OmniSharp.Extensions.LanguageServer.Protocol.Models.Range
            {
                Start = selStart,
                End = selEnd
            },
            Children = new Container<DocumentSymbol>(node.Children.Select(c => ToDocumentSymbol(c, lineStarts)))
        };
    }

    private static SymbolKind GuessKind(string tagName)
    {
        if (tagName.Contains('.'))
            return SymbolKind.Property; // property element syntax
        if (tagName.EndsWith("Window", StringComparison.OrdinalIgnoreCase) ||
            tagName.EndsWith("Control", StringComparison.OrdinalIgnoreCase) ||
            tagName.EndsWith("UserControl", StringComparison.OrdinalIgnoreCase) ||
            tagName.EndsWith("Page", StringComparison.OrdinalIgnoreCase) ||
            tagName.EndsWith("View", StringComparison.OrdinalIgnoreCase))
            return SymbolKind.Class;
        if (tagName.Equals("Style", StringComparison.OrdinalIgnoreCase) ||
            tagName.EndsWith("Template", StringComparison.OrdinalIgnoreCase))
            return SymbolKind.Class;
        if (tagName.Equals("Setter", StringComparison.OrdinalIgnoreCase))
            return SymbolKind.Property;
        if (tagName.Equals("DataTemplate", StringComparison.OrdinalIgnoreCase))
            return SymbolKind.Class;
        return SymbolKind.Object;
    }

    private class Node
    {
        public string TagName { get; set; } = string.Empty;
        public int Start { get; set; }
        public int End { get; set; }
        public int NameTokenStart { get; set; }
        public int NameTokenEnd { get; set; }
        public List<Node> Children { get; } = new();
    }
}
