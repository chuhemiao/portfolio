import fs from 'node:fs';

function readJson(file, fallback = {}) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function countBy(items, key = 'status') {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

const registry = readJson('data/research-map/registry.json', { stats: {}, projects: [] });
const candidates = readJson('data/research-map/candidates.json', { candidates: [] });
const upgradeQueue = readJson('data/research-map/depth-upgrade-queue.json', { queue: [], stats: {} });
const runState = readJson('data/research-map/longform-run-state.json', {});

const candidateCounts = countBy(candidates.candidates || []);
const upgradeCounts = countBy(upgradeQueue.queue || []);
const pendingCandidates = (candidates.candidates || []).filter((item) =>
  ['next', 'backlog', 'researching'].includes(item.status || 'backlog')
);
const pendingUpgrades = (upgradeQueue.queue || []).filter((item) =>
  ['needs-upgrade', 'researching'].includes(item.status || 'needs-upgrade')
);

console.log('Research long-form run status');
console.log(`Registry projects: ${registry.stats?.projects || registry.projects?.length || 0}`);
console.log(`Candidate total: ${candidates.candidates?.length || 0}`);
console.log(`Candidate counts: ${JSON.stringify(candidateCounts)}`);
console.log(`Pending new candidates: ${pendingCandidates.length}`);
console.log(`Upgrade queue total: ${upgradeQueue.queue?.length || 0}`);
console.log(`Upgrade counts: ${JSON.stringify(upgradeCounts)}`);
console.log(`Pending upgrades: ${pendingUpgrades.length}`);
console.log(`Objective: ${JSON.stringify(runState.objective || {})}`);

console.log('\nNext new candidates:');
for (const item of pendingCandidates.filter((candidate) => candidate.status !== 'researching').slice(0, 10)) {
  console.log(`- [${item.status || 'backlog'}] ${item.name} (${item.symbol || ''}) ${item.target || ''}`.trim());
}

console.log('\nNext upgrade reports:');
for (const item of pendingUpgrades.filter((report) => report.status !== 'researching').slice(0, 10)) {
  console.log(`- [${item.status || 'needs-upgrade'}] ${item.slug} (${item.words || 0} words)`);
}
