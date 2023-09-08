# Change Log

All notable changes to the "vscode-avalonia" extension will be documented in this file.

## [0.0.18] - 08 September 2023
### Fixes

- Extenstion not activating #39
- Extension fails to launch child process if VS Code path has spaces #41


## [0.0.17] - 01 September 2023

### Fixes

- Previewer is blank, it does not get update until focus change. [Issue #8](https://github.com/AvaloniaUI/Avalonia-VSCode-Extension/issues/8)
- Previewer doesn't work when opened from command palette. [Issue #5](https://github.com/AvaloniaUI/Avalonia-VSCode-Extension/issues/5)

## [0.0.13] - 25 August 2023

- Fixes the issue where extension fails to work when on .NET preview releases

## [0.0.11] - 24 August 2023

- Improve the XAML previewer performace
- Support Avalonia xplat solution

### Known issues

1. Previewer may take up to 10 seconds to activate for the first time if you’re using Avalonia `v0.10.*`
2. You must build the project before using the preivewer
3. Previewer may not be visible first time; switch to XAML code tab or save the file

## [0.0.6] - 03 August 2023

- Improved code completion

## [0.0.4] - 25 July 2023

- Code completion will not work for files with `\n` as newline chars [#23](https://github.com/AvaloniaUI/AvaloniaVSCode/issues/23)
- Set higher/lower limit for previewer [#18](https://github.com/AvaloniaUI/AvaloniaVSCode/issues/18)

## [0.0.3] - 19 July 2023

- Fixed the issue where `Show preview` command is available for all `xml` files (issue #15)
- Previewer now shows the preview from the active `axaml` file (issue #19)

### Known issues

- Previewer may take over 5 seconds to render if you're using Avalonia 0.10.*
- Auto complete my crash for large files

## [0.0.2] - 12 July 2023

- Offers previewer zoom in/out functionality
- Previewer now has grid bacground
- Previewer changes backgroud based on VS Code theme

### Known issues

- Previewer will not update when you switch between `axaml` files

## [0.0.1]

- Initial release
- Offers XAML auto-complete
- Offers Basic XMAL Previewer

### Known issues

- Extension works when only Avalonia project in the workspace
- You cannot zoom-in or out previwer panel
- Auto-complete lists duplicate items