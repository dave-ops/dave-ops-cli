// code2img.js
const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const hljs = require('highlight.js');
const { createCanvas } = require('canvas');
const clipboardy = require('clipboardy');

const CONFIG = {
    padding: 20,
    fontSize: 16,
    lineHeight: 1.5,
    bgColor: '#1e1e1e',
    fontFamily: 'Consolas, monospace',
    maxWidth: 800,
    historyFile: path.join(__dirname, 'image-history.json')
};

// Load or initialize history
async function loadHistory() {
    try {
        const data = await fs.readFile(CONFIG.historyFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save history
async function saveHistory(history) {
    await fs.writeFile(CONFIG.historyFile, JSON.stringify(history, null, 2));
}

async function convertCodeToImage(inputFile, outputFile) {
    try {
        const code = await fs.readFile(inputFile, 'utf8');
        const ext = path.extname(inputFile).slice(1);
        const languageMap = {
            'js': 'javascript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c'
        };
        const language = languageMap[ext] || 'javascript';

        const highlighted = hljs.highlight(code, { language }).value;
        const lines = highlighted.split('\n');

        const lineHeight = CONFIG.fontSize * CONFIG.lineHeight;
        const canvasHeight = lines.length * lineHeight + CONFIG.padding * 2;
        const canvasWidth = CONFIG.maxWidth;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = `${CONFIG.fontSize}px ${CONFIG.fontFamily}`;
        ctx.textBaseline = 'top';

        let x = CONFIG.padding;
        let y = CONFIG.padding;
        let currentColor = '#ffffff';

        lines.forEach(line => {
            const parts = line.split(/(<span class="hljs-[^"]*">|<\/span>)/g);
            parts.forEach(part => {
                if (part.startsWith('<span class="hljs-')) {
                    const className = part.match(/hljs-([^"]*)/)?.[1];
                    const colors = {
                        'keyword': '#569cd6',
                        'string': '#ce9178',
                        'comment': '#6a9955',
                        'number': '#b5cea8',
                        'function': '#dcdcaa'
                    };
                    currentColor = colors[className] || '#ffffff';
                } else if (part === '</span>') {
                    currentColor = '#ffffff';
                } else {
                    ctx.fillStyle = currentColor;
                    ctx.fillText(part, x, y);
                    x += ctx.measureText(part).width;
                }
            });
            x = CONFIG.padding;
            y += lineHeight;
        });

        const buffer = canvas.toBuffer('image/png');
        const fullOutputPath = path.resolve(outputFile);
        await fs.writeFile(fullOutputPath, buffer);

        // Update history
        const history = await loadHistory();
        if (!history.includes(fullOutputPath)) {
            history.push(fullOutputPath);
            await saveHistory(history);
        }

        console.log(`Image saved as ${fullOutputPath}`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

async function copyImagesToClipboard() {
    try {
        const history = await loadHistory();
        if (history.length === 0) {
            console.log('No images in history');
            return;
        }

        // On Windows, we can only copy one image at a time to clipboard
        // We'll copy the most recent one and list all paths
        const mostRecentImage = history[history.length - 1];
        const imageData = await fs.readFile(mostRecentImage);
        
        // clipboardy doesn't support images directly on Windows, 
        // so we'll copy the file paths as text instead
        const pathsText = history.join('\n');
        await clipboardy.write(pathsText);
        
        console.log('Copied image paths to clipboard:');
        history.forEach((imgPath, index) => {
            console.log(`${index + 1}. ${imgPath}`);
        });
        console.log(`Note: Most recent image path (${mostRecentImage}) is at the top of clipboard`);
    } catch (error) {
        console.error('Error copying to clipboard:', error.message);
        process.exit(1);
    }
}

// CLI setup
program
    .version('1.0.0')
    .description('Convert code files to images and manage them');

program
    .command('convert')
    .description('Convert a code file to an image')
    .arguments('<input> [output]')
    .action(async (input, output) => {
        const outputFile = output || path.basename(input, path.extname(input)) + '.png';
        await convertCodeToImage(input, outputFile);
    });

program
    .command('copy')
    .description('Copy all generated image paths to clipboard')
    .action(copyImagesToClipboard);

program.parse(process.argv);