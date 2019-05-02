'use strict';
const csv = require('csvtojson');
const groupBy = require('lodash.groupby');
const jsonexport = require('jsonexport');
const fs = require('fs');

const csvFilePath = './input.csv';

//read csv
csv()
  .fromFile(csvFilePath)
  .then(async jsonObj => {
    console.log(jsonObj);
    const groupByColumA = groupBy(jsonObj, 'ColumnA'); //lodash.groupby
    const keys = Object.keys(groupByColumA);

    keys.forEach(key => {
      jsonexport(groupByColumA[key], (err, csvOutput) => {
        //jsonexport to convert json to csv
        if (err) return console.log(err);
        const csvToCreateFile = removeFirstColumnFromCSV(csvOutput);
        console.log(csvToCreateFile);
        fs.writeFile(key + '.csv', csvToCreateFile, err => {
          if (err) return console.log(err); //if error occurss
        });
      });
    });
  });

function removeFirstColumnFromCSV(inputCsv) {
  const outputCSV = inputCsv
    .split('\n')
    .map(line => {
      let columns = line.split(','); // get the columns
      columns.splice(0, 1); // remove total column
      return columns;
    })
    .join('\n'); // join on newlines
  return outputCSV;
}
