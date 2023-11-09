# Avalonia for Visual Studio Code

## Requires Avalonia v11.0.2 or lower

The extension require Avalonia nuget package v11.0.2 or lower. The latest version **v11.0.5 of Avalonia package will break the previewer**

<hr/>

Avalonia is a cross-platform XAML-based UI framework providing a flexible styling system and supporting a wide range of Operating Systems such as Windows via .NET Framework and .NET Core, Linux via Xorg and macOS.

The Avalonia for Visual Studio Code Extension contains support for Avalonia XAML autocomplete and previewer.

Follow the [contribution guide](CONTRIBUTING.md) if you want to help us build the extension

## Getting Started

### Create a new Avalonia project

You can create a new Avalonia project directly from the Visual Studio Code

![New Project](media/NewProject.png)

Additionally, you can create a project from the command line too, with the command:

    $ dotnet new avalonia.app -o MyApp

This will create a new folder called `MyApp` with your application files. You can install Avalonia project templates with following command, if you do not have them installed already:

    $ dotnet new install Avalonia.Templates

Finally open the MyApp folder in the VS Code, open any axaml file to activate the extension and code completion.

> NOTE: You must build the project to enable code completion for now.

### Enable Previewer

![Previewer](media/PreviewerRM.png)

After you load the project in the VS Code, you can click on Show Preview button on the editor toolbar (1)

The previewer requires that your project is built, and has required metadata. When you open the project for the first time, or clean the project. Click on Generate Assets button (2), and wait for a couple of seconds to preview the XAML file.

The previewer will refresh when you switch between multiple xaml files, unlike Visual Studio for Windows or Rider, VS Code will reuse the single preview window.

### XAML Code completion

The Avalonia XAML in the VS Code is powered by the same code completion engine available for Visual Studio on Windows.

Rich syntax highlighter and contextual code complete will make it lot easier to read and write XAML files

![Code completion](media/AutoCompleteRM.png)