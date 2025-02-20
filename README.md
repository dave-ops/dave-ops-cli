# dave-ops CLI - `code2img`

## Description
`dave-ops-cli` is a command-line tool that converts code files (e.g., JavaScript, Python, Java, C, C++) into visually appealing images using syntax highlighting. It also allows you to manage generated images, including copying the actual images to the clipboard for easy sharing or pasting. Built with Node.js, this tool leverages libraries like `highlight.js` for syntax highlighting, `canvas` for image generation, and `clipboardy` for clipboard operations.

## Features
- Convert code files (e.g., `.js`, `.py`, `.java`, `.cpp`, `.c`) to PNG images with customizable styling (background color, font, padding).
- Syntax highlighting using `highlight.js` for readable code visualization.
- Maintain a history of generated images and copy the most recent image to the clipboard.
- Cross-platform support, with specific optimizations for Windows.

## Prerequisites
- Node.js (v16.0.0 or higher recommended, currently tested with v22.12.0)
- npm (Node Package Manager)

## Installation

1. Clone the repository or download the source code:
   ```bash
   git clone https://github.com/dave-ops/dave-ops-cli.git
   cd dave-ops-cli
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. (Optional) Link the `code2img` binary globally to use it from any directory:
   ```bash
   npm link
   ```

## Usage

### Commands
Run `code2img` with the following commands:

#### `convert <input> [output]`
Converts a code file to a PNG image.
- `<input>`: Path to the code file (e.g., `src/server.js`).
- `[output]`: Optional output path for the image (defaults to `<input-basename>.png`).

**Example:**
```bash
code2img convert src/server.js server.png
```
This generates an image (`server.png`) from `src/server.js` with syntax highlighting.

#### `copy`
Copies the most recent generated image to the clipboard, allowing you to paste it into applications like Microsoft Paint, Word, or other editors.

**Example:**
```bash
code2img copy
```
This copies the latest image (e.g., `server.png`) from the image history to the clipboard.

### Styling
The generated images use the following default styling (configurable in `code2img.mjs`):
- Background color: `#1e1e1e` (dark gray)
- Font: `Consolas, monospace`
- Font size: 16px
- Line height: 1.5
- Padding: 20px
- Max width: 800px

To customize, modify the `CONFIG` object in `code2img.mjs`.

## Project Structure
- `code2img.mjs`: The main script for the `code2img` tool.
- `image-history.json`: Stores the history of generated image paths.
- `package.json`: Project configuration and dependencies.
- `src/`: Directory for source code files (e.g., `server.js`).

## Dependencies
- `canvas@^3.1.0`: For generating images.
- `clipboardy@^4.0.0`: For clipboard operations (text and image data on Windows).
- `commander@^13.1.0`: For CLI parsing.
- `highlight.js@^11.11.1`: For syntax highlighting.

## Known Issues
- On Windows, copying images to the clipboard uses a workaround with `clip` and `certutil`. This may not work reliably for all applications or large images. For robust image copying, consider using a native Windows clipboard library (e.g., `node-win32clipboard`).
- ES Module compatibility: Ensure Node.js v16.0.0 or higher is used, as `__dirname` and `__filename` are replaced with `import.meta.url` and `fileURLToPath`.
