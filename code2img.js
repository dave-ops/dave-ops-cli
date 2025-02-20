#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs').promises;
const hljs = require('highlight.js');
const { createCanvas, loadImage } = require('canvas');

// Default styling constants
const CONFIG = {
    padding: 20,
    fontSize: 16,
    lineHeight: 1.5,
    bgColor: '#1e1e1e',
    fontFamily: 'Consolas, Monaco, monospace',
    maxWidth: 800
};

async function convertCodeToImage(inputFile, outputFile) {
    try {
        // Read the code file
        const code = await fs.readFile(inputFile, 'utf8');
        
        // Detect language based on file extension
        const ext = inputFile.split('.').pop();
        const languageMap = {
            'js': 'javascript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c'
        };
        const language = languageMap[ext] || 'javascript';

        // Highlight the code
        const highlighted = hljs.highlight(code, { language }).value;
        const lines = highlighted.split('\n');

        // Calculate dimensions
        const lineHeight = CONFIG.fontSize * CONFIG.lineHeight;
        const canvasHeight = lines.length * lineHeight + CONFIG.padding * 2;
        const canvasWidth = CONFIG.maxWidth;

        // Create canvas
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Set up text rendering
        ctx.font = `${CONFIG.fontSize}px ${CONFIG.fontFamily}`;
        ctx.textBaseline = 'top';

        // Simple HTML parser for highlighted code
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

        // Save the image
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputFile, buffer);
        
        console.log(`Image saved as ${outputFile}`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// CLI setup
program
    .version('1.0.0')
    .description('Convert code files to images')
    .arguments('<input> [output]')
    .action(async (input, output) => {
        const outputFile = output || input.replace(/\.[^/.]+$/, '') + '.png';
        await convertCodeToImage(input, outputFile);
    });

program.parse(process.argv);