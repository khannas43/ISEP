/**
 * Fast dev clean: rename .next aside (instant on same volume) instead of rm -rf,
 * which can hang on iCloud / duplicate conflict files / deep standalone trees.
 * Old folders are named .next-trash-<timestamp>; remove them manually or run purge.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const nextDir = path.join(root, '.next');

if (!fs.existsSync(nextDir)) {
  console.log('No .next to remove.');
  process.exit(0);
}

const trashName = `.next-trash-${Date.now()}`;
const trashDir = path.join(root, trashName);

try {
  fs.renameSync(nextDir, trashDir);
  console.log(`Moved .next → ${trashName} (safe to delete that folder when convenient).`);
} catch (e) {
  console.warn('Rename failed, falling back to rmSync (may take a while)…', e.message);
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('Removed .next');
  } catch (e2) {
    console.error('Could not remove .next:', e2.message);
    console.error('Close editors/terminals using this folder, then delete frontend/.next manually.');
    process.exit(1);
  }
}
