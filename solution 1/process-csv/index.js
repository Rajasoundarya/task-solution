(function() {
  'use strict';
  const inputFilePath = './input.csv';
  const fs = require('fs');

  const ctrl = function(inputFilePath, fs) {

    const parseCSVContent = function(rows) {
      const values = [];

      for (let i = 1; i < rows.length; i++) {
        const index = rows[i].indexOf(',');
        const row = {};

        row.key = rows[i].substring(0, index);
        row.value = rows[i].substring(index + 1);
        values.push(row);
      }
      const groupByKey = values.reduce(function(r, a) {
        r[a.key] = r[a.key] || [];
        r[a.key].push(a);

        return r;
      }, Object.create(null));

      return groupByKey;
    };

    const splitCSV = function(inputData, columnHeader) {
      const keys = Object.keys(inputData);
      const promises = [];

      keys.forEach(fileName => {
        const fileContent = [];

        fileContent.push(columnHeader);
        inputData[fileName].forEach(data => {
          fileContent.push(data.value);
        });
        promises.push(writeCSV(fileContent, fileName));
      });

      return Promise.all(promises);
    };

    const writeCSV = function(fileContent, fileName) {
      return new Promise((resolve, reject) => {
        fs.writeFile(fileName + '.csv', fileContent.join('\r\n'), err => {
          if (err) {
            reject(console.log(err));
          } //if error occurss
          console.log('File is saved successfully');
          resolve('File is saved successfully');
        });
      });
    };

    const readFile = function(path) {
      let fileContent;

      return new Promise(function(resolve, reject) {
        fileContent = fs.readFileSync(path, { encoding: 'utf8' });
        if (!fileContent) {
          reject('An error occured while reading file');
        }
        resolve(fileContent);
      });
    };

    const processCSVContent = function(path) {
      readFile(path).then(fileContent => {
        if (!fileContent) {
          return null;
        }

        const rows = fileContent.split('\r\n');

        if (rows.length === 0) {
          return null;
        }
        const csvContent = parseCSVContent(rows);
        const columnHeader = rows[0].substring(rows[0].indexOf(',') + 1);

        return splitCSV(csvContent, columnHeader);
      });
    };

    const init = function(inputFilePath) {
      processCSVContent(inputFilePath);
    };

    init(inputFilePath);
  };
  ctrl(inputFilePath, fs);
})();
