const functions = require('firebase-functions');
const express = require("express");
const cors = require('cors');
const requestPromise = require('request-promise-native');
const csvSync = require('csv-parse/lib/sync');

const app = express();
app.use(cors());

const getDataFromCsv = async filePath => {
  const result = await requestPromise(filePath);
  return result;
}

app.get('/covid19', (req, res) => {
  const file_path = `https://covid.ourworldindata.org/data/ecdc/full_data.csv`;
  getDataFromCsv(file_path)
    .then(response => {
      const json = csvSync(response);
      const data = json
        .filter((x, index) => index !== 0)
        // .filter((x, index) => index !== 0 && x[1] === req.params.location)
        .map(x => {
          return {
            date: x[0],
            location: x[1],
            new_cases: Number(x[2]),
            new_deaths: Number(x[3]),
            total_cases: Number(x[4]),
            total_deaths: Number(x[5]),
            death_per_case: Math.round((Number(x[5]) * 100 * 100) / Number(x[4])) / 100,
          }
        })
      res.send(data)
    })
});

const api = functions.https.onRequest(app);
module.exports = { api };