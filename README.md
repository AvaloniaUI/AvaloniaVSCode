# Avalonia for Visual Studio Code


Avalonia is a cross-platform XAML-based UI framework providing a flexible styling system and supporting a wide range of Operating Systems such as Windows via .NET Framework and .NET Core, Linux via Xorg and macOS.

The Avalonia for Visual Studio Code Extension contains support for Avalonia XAML autocomplete and previewer.

## Getting started with Avalonia

Ready to get started with Avalonia? Follow these steps to install the templates and create your first application.

## Installation

To install the Avalonia templates, run the following command:

```bash
dotnet new install Avalonia.Templates
```

> Note: For .NET 6.0 and earlier, replace `install` with `--install` instead.

## Creating a New Application

Once the templates are installed, you can create a new Avalonia application by running the following command:

```bash
dotnet new avalonia.app -o MyApp
```

This will create a new folder called `MyApp` with your application files. To run your application, navigate to the `MyApp` directory and run:

```bash
cd MyApp
dotnet run
```

That's it! Your Avalonia application is now up and running. You can open the `MyApp` folder to start improving and building upon your application

### Open and Run project in Visual Studio Code

Run `code .` from the project directory `MyApp`. To start your appliction hit `F5`!