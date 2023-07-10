#!/bin/bash

# Print current path
echo "Current path: $(pwd)"

# Get path to dotnet executable
DOTNET_PATH=$(which dotnet)

# Check if dotnet is installed
if [ -z "$DOTNET_PATH" ]
  then
    echo "dotnet not found"
    exit 1
fi

# Print project path
echo "project path to $1"

# Remove output directory
rm -rf "$2"

$DOTNET_PATH build "$1" -c Release \
    /property:GenerateFullPaths=true \
    /consoleloggerparameters:NoSummary \
    --output "$2"

# Copy LICENSE file to local directory
cp ../../LICENSE .

# Check if output path is provided
if [ -z "$3" ]
  then
    echo "Output path not provided"
    vsce package
else
    # Create output directory if it doesn't exist
    if [ ! -d "$3" ]
    then
        echo "Creating output directory: $3"
        mkdir -p "$3"
    fi

    # Print output path
    echo "Packaging extension to $3"

    # Package the extension
    vsce package -o "$3"
fi

# Remove LICENSE file from local directory
rm LICENSE