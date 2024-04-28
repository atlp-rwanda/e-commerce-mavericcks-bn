const fs = require('fs');
const path = require('path');

const sourceDir = 'src/database';
const destDir = 'dist/src/database'; // Change the destination directory

// Function to recursively find JavaScript files in a directory
function findJsFiles(dir) {
  const files = fs.readdirSync(dir);
  const jsFiles = [];
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      jsFiles.push(...findJsFiles(filePath));
    } else if (path.extname(file) === '.js') {
      jsFiles.push(filePath);
    }
  });
  return jsFiles;
}

// Find all JavaScript files in the source directory
const jsFiles = findJsFiles(sourceDir);

// Copy each JavaScript file to the destination directory
jsFiles.forEach(file => {
  const relativePath = path.relative(sourceDir, file);
  const destPath = path.join(destDir, relativePath);
  const destDirname = path.dirname(destPath);
  if (!fs.existsSync(destDirname)) {
    fs.mkdirSync(destDirname, { recursive: true });
  }
  fs.copyFileSync(file, destPath);
});
