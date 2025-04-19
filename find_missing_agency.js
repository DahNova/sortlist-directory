const fs = require('fs');
const path = require('path');

function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function main() {
  const agenciesFile = path.join(__dirname, 'extracted_agencies.json');
  const agenciesDir = path.join(__dirname, 'web_agencies_italia_json');

  // Read and parse extracted_agencies.json
  const agenciesData = JSON.parse(fs.readFileSync(agenciesFile, 'utf-8'));

  // Get list of filenames (without .json) in web_agencies_italia_json
  const filenames = fs.readdirSync(agenciesDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json'));

  // Normalize filenames
  const normalizedFilenames = new Set(filenames.map(normalizeName));

  // Iterate agencies to find first missing
  for (const agency of agenciesData) {
    if (!agency.agencyName) continue;
    const normalizedAgencyName = normalizeName(agency.agencyName);
    if (!normalizedFilenames.has(normalizedAgencyName)) {
      // Output original name and website URL only
      console.log(agency.agencyName);
      console.log(agency.websiteURL);
      return;
    }
  }

  // If none missing
  console.log('All agencies have matching files.');
}

main();