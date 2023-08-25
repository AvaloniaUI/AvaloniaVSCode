# Avalonia for Visual Studio Code

Avalonia is a cross-platform XAML-based UI framework providing a flexible styling system and supporting a wide range of Operating Systems such as Windows via .NET Framework and .NET Core, Linux via Xorg and macOS.

The Avalonia for Visual Studio Code Extension contains support for Avalonia XAML autocomplete and previewer.

## Getting Started

### Create a new Avalonia project

You need to create a new Avalonia project from the command line, the extension does not have a way to create a new project from the VS Code yet.

You can create a new Avalonia application by running the following command:

``` shell
dotnet new avalonia.app -o MyApp
```

This will create a new folder called `MyApp` with your application files. You can install Avalonia project templates with following command, if you do not have them installed already:

``` shell
dotnet new install Avalonia.Templates
```

Finally open the MyApp folder in the VS Code, open any axaml file to activate the extension and code completion.

> NOTE: You must build the project to enable code completion and previewer

### Enable Previewer

![Previewer](https://i.imgur.com/WN86W4B.png)

After you load the project in the VS Code, you can click on Show Preview button on the editor toolbar (1)

The previewer requires that your project is built, and has required metadata. When you open the project for the first time, or clean the project. Click on Generate Assets button (2), and wait for a couple of seconds to preview the XAML file.

The previewer will refresh when you switch between multiple xaml files, unlike Visual Studio for Windows or Rider, VS Code will reuse the single preview window.

### XAML Code completion

The Avalonia XAML in the VS Code is powered by the same code completion engine available for Visual Studio on Windows.

Rich syntax highlighter and contextual code complete will make it lot easier to read and write XAML files

![Code completion](https://i.imgur.com/QVePVpq.png)


## Limitation/Known Issues

1. Previewer may take up to 10 seconds to activate for the first time if you’re using Avalonia `v0.10.*`
2. You must build the project before using the preivewer
3. Previewer may not be visible first time; switch to XAML code tab or save the file

## Troubleshooting guide

Common issues

**The previewer is stuck on `Generate Assets` message**

Close the VS Code, build you solution or project manually from a terminal. Use `dotnet build` command.

Reopen the VS Code and load your project folder

**My solution does not have an executable project**

The extension does not work with workspace with only library project. Please use `avalonia.xplat` template or create an Avalonia app and add your library project to the app 