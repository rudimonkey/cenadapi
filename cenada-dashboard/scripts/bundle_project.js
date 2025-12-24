const fs = require('fs');
const path = require('path');

const outputFile = 'project_bundle.txt';
// Directories to exclude
const excludeDirs = [
    'node_modules',
    '.git',
    'dist',
    '.angular',
    '.vscode',
    '.idea'
];

// File extensions or names to exclude
const excludeFiles = [
    'package-lock.json',
    'project_bundle.txt', // Don't include the output file itself
    'build-output.txt',
    '.DS_Store',
    'Thumbs.db'
];

// Binary or non-text extensions to skip
const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
    '.woff', '.woff2', '.ttf', '.eot',
    '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
    '.exe', '.dll', '.so', '.dylib', '.bin', '.dat'
];

function isBinary(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return binaryExtensions.includes(ext);
}

function shouldExclude(dirOrFile) {
    return excludeDirs.includes(dirOrFile) || excludeFiles.includes(dirOrFile);
}

function walkDir(dir, fileStream) {
    const files = fs.readdirSync(dir).sort();

    for (const file of files) {
        if (shouldExclude(file)) {
            continue;
        }

        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath, fileStream);
        } else {
            if (isBinary(filePath)) {
                // console.log(`Skipping binary file: ${filePath}`);
                continue;
            }

            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const relativePath = path.relative(__dirname, filePath); // Relative to script location, maybe relative to root is better?

                // Let's make path relative to CWD (root usually)
                const relativeToRoot = path.relative(process.cwd(), filePath);

                fileStream.write(`\n================================================================================\n`);
                fileStream.write(`FILE PATH: ${relativeToRoot}\n`);
                fileStream.write(`================================================================================\n\n`);
                fileStream.write(content);
                fileStream.write(`\n\n`);

                console.log(`Added: ${relativeToRoot}`);
            } catch (err) {
                console.error(`Error reading file ${filePath}: ${err.message}`);
                fileStream.write(`\n[ERROR READING FILE: ${filePath}]\n`);
            }
        }
    }
}

function main() {
    const rootDir = process.cwd();
    const outputPath = path.join(rootDir, outputFile);

    console.log(`Bundling project from: ${rootDir}`);
    console.log(`Output file: ${outputPath}`);

    const stream = fs.createWriteStream(outputPath, { flags: 'w' });

    walkDir(rootDir, stream);

    stream.end();
    console.log('Done!');
}

main();
