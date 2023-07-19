#!/bin/bash

# Copy LICENSE file to local directory
cp ../../LICENSE .

# Check if output path is provided
if [ -z "$1" ]
  then
    echo "Output path not provided"
    vsce package
else
    # Create output directory if it doesn't exist
    if [ ! -d "$1" ]
    then
        echo "Creating output directory: $1"
        mkdir -p "$1"
    fi

    # Print output path
    echo "Packaging extension to $1"

    # Package the extension
    vsce package --pre-release -o "$1"
fi

# Remove LICENSE file from local directory
rm LICENSE