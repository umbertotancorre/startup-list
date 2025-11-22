# Extension Icons

To create proper icons for the extension, you need PNG files at three sizes:

- `icon16.png` - 16x16 pixels (toolbar)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

Use the provided `icon.svg` as a template, or create your own.

### Using ImageMagick (if installed)

```bash
# From the extension directory
convert icons/icon.svg -resize 16x16 icons/icon16.png
convert icons/icon.svg -resize 48x48 icons/icon48.png
convert icons/icon.svg -resize 128x128 icons/icon128.png
```

### Using Online Tools

1. Visit a tool like [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Upload `icon.svg`
3. Set output size (16x16, 48x48, 128x128)
4. Download and rename to `icon16.png`, `icon48.png`, `icon128.png`

### Using Figma/Sketch/Design Tool

1. Import `icon.svg`
2. Export at 3 different sizes
3. Save as PNG files with correct names

## Placeholder Icons

For development, you can use simple placeholder PNGs. The extension will work fine, just won't look as polished.

