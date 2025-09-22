const express = require('express');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const app = express();
const PORT = 3000;

app.use(express.json());

const datasetPath = path.join(__dirname, 'datafile.xml');

app.post('/bloodbanks', (req, res) => {
  const cityInput = req.body.city;

  if (!cityInput) {
    return res.status(400).json({ error: 'Please provide a city in the request body.' });
  }

  fs.readFile(datasetPath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read dataset file.' });
    }

    xml2js.parseString(data, { explicitArray: false }, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to parse XML data.' });
      }

      const rows = result.DATASET;

      if (!rows) {
        return res.status(500).json({ error: 'No data found in XML.' });
      }

      // Extract all row keys like ROW1, ROW2, ...
      const bloodBanks = Object.values(rows);

      // Filter by city (case-insensitive)
      const filteredBanks = bloodBanks.filter(bank => {
        if (!bank.CITY) return false;
        return bank.CITY.toLowerCase().trim() === cityInput.toLowerCase().trim();
      });

      if (filteredBanks.length === 0) {
        return res.json({ message: `No blood banks found for city: ${cityInput}` });
      }

      res.json(filteredBanks);
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
