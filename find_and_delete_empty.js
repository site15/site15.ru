const fs = require('fs');
const path = require('path');

/**
 * Checks if a directory is empty
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} - True if directory is empty, false otherwise
 */
function isDirectoryEmpty(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
    return false;
  }
}

/**
 * Checks if a file is empty
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if file is empty, false otherwise
 */
function isFileEmpty(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size === 0;
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return false;
  }
}

/**
 * Recursively finds and optionally deletes empty files and directories
 * @param {string} currentPath - Current path to process
 * @param {boolean} shouldDelete - Whether to actually delete the empty items
 * @returns {Object} - Summary of what was found/deleted
 */
function findAndDeleteEmpty(currentPath, shouldDelete = false) {
  let emptyFiles = [];
  let emptyDirs = [];

  // Skip node_modules directory
  if (path.basename(currentPath) === 'node_modules') {
    return { emptyFiles, emptyDirs };
  }

  try {
    const stats = fs.statSync(currentPath);

    if (stats.isFile()) {
      // Check if file is empty
      if (isFileEmpty(currentPath)) {
        emptyFiles.push(currentPath);
        if (shouldDelete) {
          fs.unlinkSync(currentPath);
          console.log(`Deleted empty file: ${currentPath}`);
        }
      }
    } else if (stats.isDirectory()) {
      // First, process all items inside the directory
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        // Skip node_modules directory
        if (item === 'node_modules') {
          continue;
        }

        const result = findAndDeleteEmpty(itemPath, shouldDelete);
        emptyFiles = emptyFiles.concat(result.emptyFiles);
        emptyDirs = emptyDirs.concat(result.emptyDirs);
      }

      // After processing contents, check if directory itself is now empty
      if (isDirectoryEmpty(currentPath)) {
        emptyDirs.push(currentPath);
        if (shouldDelete) {
          fs.rmdirSync(currentPath);
          console.log(`Deleted empty directory: ${currentPath}`);
        }
      }
    }
  } catch (err) {
    // Skip files/directories that can't be accessed
    console.error(`Error accessing path ${currentPath}:`, err.message);
  }

  return { emptyFiles, emptyDirs };
}

// Main execution
function main() {
  const rootDir = process.argv[2] || process.cwd();
  console.log(`Scanning directory: ${rootDir}`);

  // First, find all empty files and directories (dry run)
  console.log('\n--- DRY RUN: Finding empty files and directories ---');
  const dryRunResult = findAndDeleteEmpty(rootDir, false);

  console.log(`\nFound ${dryRunResult.emptyFiles.length} empty file(s):`);
  dryRunResult.emptyFiles.forEach((file) => console.log(`  - ${file}`));

  console.log(`\nFound ${dryRunResult.emptyDirs.length} empty directory(ies):`);
  dryRunResult.emptyDirs.forEach((dir) => console.log(`  - ${dir}`));

  // If there are empty items, ask for confirmation before deleting
  if (dryRunResult.emptyFiles.length > 0 || dryRunResult.emptyDirs.length > 0) {
    console.log('\n--- DELETION PHASE ---');
    const finalResult = findAndDeleteEmpty(rootDir, true);
    console.log(
      `\nDeleted ${finalResult.emptyFiles.length} empty file(s) and ${finalResult.emptyDirs.length} empty directory(ies)`,
    );
  } else {
    console.log('\nNo empty files or directories found.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findAndDeleteEmpty, isFileEmpty, isDirectoryEmpty };
