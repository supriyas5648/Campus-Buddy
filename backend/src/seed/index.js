'use strict';

const { spawn } = require('child_process');
const path = require('path');

function run(script) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [path.join(__dirname, script)], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} failed with exit code ${code}`));
    });
  });
}

async function main() {
  try {
    console.log('Seeding campus data...');
    await run('seedDatabase.js');

    console.log('\nSeeding users...');
    await run('seedUsers.js');

    console.log('\nAll seed scripts completed successfully.');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();