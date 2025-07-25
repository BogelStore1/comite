const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');

// ==== Konfigurasi ====
const GIT_USERNAME = 'BogelStore1';           // Ganti
const GIT_REPO_NAME = 'comite';                 // Ganti jika mau
const GIT_EMAIL = 'qrefandi9@gmail.com';
const TOKEN_URL = 'https://bogelhost.biz.id/github/token.txt'; // URL token kamu

async function getTokenFromRemote() {
  try {
    const response = await axios.get(TOKEN_URL);
    return response.data.trim();
  } catch (e) {
    console.error("❌ Gagal mengambil token dari URL:", e.message);
    process.exit(1);
  }
}

function runCommand(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Gagal menjalankan: ${cmd}`);
  }
}

async function setupGitRepo(GITHUB_TOKEN) {
  const GIT_REMOTE = `https://${GIT_USERNAME}:${GITHUB_TOKEN}@github.com/${GIT_USERNAME}/${GIT_REPO_NAME}.git`;

  if (!fs.existsSync('.git')) {
    console.log('🔧 Inisialisasi repo lokal...');
    runCommand('git init');
    runCommand(`git config user.name "${GIT_USERNAME}"`);
    runCommand(`git config user.email "${GIT_EMAIL}"`);
    runCommand('git branch -M main');
    runCommand(`git remote add origin ${GIT_REMOTE}`);
  } else {
    console.log('ℹ️ Repo git lokal sudah ada.');
  }

  return GIT_REMOTE;
}

function autoCommit() {
  const today = new Date().toISOString().split('T')[0];
  const filename = `commit-${today}.txt`;

  fs.writeFileSync(filename, `Auto commit on ${today}`);
  runCommand('git add .');

  try {
    runCommand(`git commit -m "chore: auto commit on ${today}"`);
  } catch (e) {
    console.log("⛔ Tidak ada perubahan, commit dilewati.");
  }
}

async function main() {
  console.log("🚀 Menjalankan auto commit bot...");

  const GITHUB_TOKEN = await getTokenFromRemote();
  const GIT_REMOTE = await setupGitRepo(GITHUB_TOKEN);

  autoCommit();
  runCommand(`git push ${GIT_REMOTE} main`);

  // Loop 24 jam
  setInterval(() => {
    console.log("🔁 Commit harian...");
    autoCommit();
    runCommand(`git push ${GIT_REMOTE} main`);
  }, 86400000); // 24 jam
}

main();