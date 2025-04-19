const fs = require('fs');
const path = require('path');

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const agencies = JSON.parse(fs.readFileSync('extracted_agencies.json', 'utf-8'));
const existingFiles = fs.readdirSync('web_agencies_italia_json').filter(f => f.endsWith('.json'));
const existingNames = new Set(existingFiles.map(f => path.basename(f, '.json')));

for (const agency of agencies) {
  const normalized = normalizeName(agency.agencyName);
  if (normalized && !existingNames.has(normalized)) {
    console.log(JSON.stringify({ agencyName: agency.agencyName, websiteURL: agency.websiteURL, normalized }));
    break;
  }
}