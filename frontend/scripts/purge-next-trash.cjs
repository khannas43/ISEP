/** Remove stale .next-trash-* folders created by clean-next.cjs */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let n = 0;
for (const name of fs.readdirSync(root)) {
  if (!name.startsWith('.next-trash-')) continue;
  const full = path.join(root, name);
  try {
    fs.rmSync(full, { recursive: true, force: true });
    console.log('Removed', name);
    n++;
  } catch (e) {
    console.warn('Skip', name, e.message);
  }
}
if (n === 0) console.log('No .next-trash-* folders found.');
