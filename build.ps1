$root = Get-Location;
$vscode_avalonia = "$(Get-Location)\src\vscode-avalonia"
$avalonia_lsp = "$(Get-Location)\src\AvaloniaLSP\AvaloniaLanguageServer\AvaloniaLanguageServer.csproj"
$avalonia_sp = "$(Get-Location)\src\SolutionParser\SolutionParser.csproj"

# yarn install
try {
    npm install --global yarn tsc typescript @vscode/vsce
}
catch {
    Write-Host "Error: `"npm install --global yarn tsc typescript @vscode/vsce`""
    break;
}

try {
    Set-Location "$vscode_avalonia"
    yarn config set "strict-ssl" false
    yarn install
    Set-Location "$root"
}
catch { 
    Write-Host "Error: `"yarn install`"" 
    break;
}

# Build Avalonia LSP
try {
    dotnet build "$avalonia_lsp" /property:GenerateFullPaths=true --output "$vscode_avalonia\avaloniaServer"
}
catch {
    Write-Host "Error: `"dotnet build `"$avalonia_lsp`" /property:GenerateFullPaths=true --output `"$vscode_avalonia\avaloniaServer`"`""
    break;
}

# Build Solution parser
try {
    dotnet build "$avalonia_sp" /property:GenerateFullPaths=true --output "$vscode_avalonia\solutionParserTool"
}
catch {
    Write-Host "Error: `"dotnet build `"$avalonia_sp`" /property:GenerateFullPaths=true --output `"$vscode_avalonia\solutionParserTool`""
    break;
}

Write-Host "Successful"