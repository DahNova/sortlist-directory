const fs = require('fs');
const path = require('path');

function readJsonFileSync(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error reading JSON file ${filePath}:`, e);
    return null;
  }
}

function readAllJsonFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(readAllJsonFiles(fullPath));
    } else if (file.isFile() && file.name.endsWith('.json')) {
      const json = readJsonFileSync(fullPath);
      if (json) results.push({ json, file: fullPath });
    }
  }
  return results;
}

function extractFromOldAgenciesJson() {
  const dir = path.join(__dirname, 'OLD', 'agencies_json');
  const jsonFiles = readAllJsonFiles(dir);
  return jsonFiles.map(({ json }) => ({
    agencyName: json.agencyName || '',
    websiteURL: json.websiteURL || null,
  }));
}

function extractFromAgenciesByProvince() {
  const dir = path.join(__dirname, 'OLD', 'agencies_by_province');
  const jsonFiles = readAllJsonFiles(dir);
  return jsonFiles.map(({ json }) => ({
    agencyName: json.agency_name || '',
    websiteURL: json.website_url || null,
  }));
}

function extractFromExistingAgenciesTxt() {
  const filePath = path.join(__dirname, 'OLD', 'existing_agencies_with_locations.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const agencies = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      const name = trimmed.substring(0, colonIndex).trim();
      if (name) {
        agencies.push({ agencyName: name, websiteURL: null });
      }
    }
  }
  return agencies;
}

function mergeAgencies(...lists) {
  const map = new Map();
  for (const list of lists) {
    for (const agency of list) {
      const key = agency.agencyName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, agency);
      } else {
        // If existing has no URL but new has URL, update
        const existing = map.get(key);
        if ((!existing.websiteURL || existing.websiteURL === '') && agency.websiteURL) {
          map.set(key, agency);
        }
      }
    }
  }
  return Array.from(map.values());
}

function main() {
  const oldAgencies = extractFromOldAgenciesJson();
  const byProvince = extractFromAgenciesByProvince();
  const existingAgencies = extractFromExistingAgenciesTxt();

  const combined = mergeAgencies(oldAgencies, byProvince, existingAgencies);

  console.log(`Total agencies combined: ${combined.length}`);

  const outputPath = path.join(__dirname, 'extracted_agencies.json');
  fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2), 'utf-8');
  console.log(`Combined list written to ${outputPath}`);
}

main();