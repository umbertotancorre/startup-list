#!/bin/bash

# Script to generate PNG icons from SVG
# Requires: imagemagick (brew install imagemagick) or inkscape

SVG_FILE="icons/icon.svg"
SIZES=(16 48 128)

# Check if imagemagick is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to convert icons..."
    for size in "${SIZES[@]}"; do
        convert "$SVG_FILE" -resize ${size}x${size} "icons/icon${size}.png"
        echo "Created icons/icon${size}.png"
    done
    echo "✓ All icons generated successfully!"
elif command -v inkscape &> /dev/null; then
    echo "Using Inkscape to convert icons..."
    for size in "${SIZES[@]}"; do
        inkscape "$SVG_FILE" -w ${size} -h ${size} -o "icons/icon${size}.png"
        echo "Created icons/icon${size}.png"
    done
    echo "✓ All icons generated successfully!"
else
    echo "❌ Error: Neither ImageMagick nor Inkscape found."
    echo ""
    echo "Please install one of the following:"
    echo "  - ImageMagick: brew install imagemagick"
    echo "  - Inkscape: brew install inkscape"
    echo ""
    echo "Or create PNG icons manually at sizes: 16x16, 48x48, 128x128"
    exit 1
fi

