# Contribution Guide

Welcome to Avalonia Extension for VS Code! We appreciate your interest in contributing. This guide will help you get started with contributing to our project. Please read it carefully.

## System Requirements

1. dotnet 9.0, you can download it from [here](https://dotnet.microsoft.com/en-us/download)
2. NodeJS, npm 
   You can get NodeJS and npm using NVM (Node Version Manager) by running the following command:
   
    `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`

   See: https://github.com/nvm-sh/nvm for the latest version of this command.

3. Install yarn
   yarn can be installed with the following command:
    
    `npm install -g yarn`

4. Latest Visual Studio Code

## Set up

1. Fork and Clone the repository

    `git clone --recursive https://github.com/AvaloniaUI/AvaloniaVSCode`

2. Update submodules
This extension uses git submodules to pull in the Solution Parser and the Avalonia Visual Studio repo. Run the following to pull in the submodules:

    `git submodule update --init --recursive`

3. Run the `build.sh` or `build.ps1`

## How to contribute

1. Create a new issue or use the existing to contribute (assign it yourself)
2. Create a new branch for the issue
3. Send the PR with description

## Run and Debug

Hit `F5` this will a new vscode window with the dev extension running. Open an avalonia project to use it.

## Package Extension

Make sure you run the `build.sh` or `build.ps1` before packaging

1. Open command palette (shift + cmd + p)
2. Select `Task: Run Task`
3. Select `Package Extension`
