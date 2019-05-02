'use strict';
const inputFilePath = './input.csv';
const fs = require('fs');
const AWS = require('aws-sdk');

const S3 = {
  BUCKET_NAME: 'example-bucket',
  REGION: 'us-east-1'
};

//Prod Handler
module.exports.processCsv = async (event, inputFilePath, callback) => {
  try {
    ctrl(inputFilePath);
  } catch (err) {
    console.log(err);
  }
};

const ctrl = function(inputFilePath) {

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
      let fileContent = [];

      fileContent.push(columnHeader);
      inputData[fileName].forEach(data => {
        fileContent.push(data.value);
      });
      fileContent = fileContent.join('\r\n');
      promises.push(putFileToS3Bucket({fileContent, fileName}));
    });

    return Promise.all(promises);
  };

  const putFileToS3Bucket = function(uploadData) {
    const { fileContent, fileName } = uploadData;
    console.log(fileContent);
    const s3 = new AWS.S3({ apiVersion: 'latest', region: S3.REGION });
    const params = {
      Body: fileContent,
      Bucket: S3.BUCKET_NAME,
      Key: fileName + '.csv'
    };
    return new Promise((resolve,reject)=>{
      s3.putObject(params, function(err, data) {
        if (err) reject(err, err.stack);
        // an error occurred
        else resolve(data); // successful response
      });
    })
  }

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

//DEV Handler
try {
  ctrl(inputFilePath);
} catch (err) {
  console.log(err);
}