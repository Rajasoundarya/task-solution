'use strict';
const csv = require('csvtojson');
const groupBy = require('lodash.groupby');
const jsonexport = require('jsonexport');
const AWS = require('aws-sdk');

const inputFilePath = './input.csv';
const S3 = {
  BUCKET_NAME: 'example-bucket',
  REGION: 'us-east-1'
};
//Prod Handler
module.exports.processCsv = async (event, inputFilePath, callback) => {
  try {
    mainTask(inputFilePath);
  } catch (err) {
    console.log(err);
  }
};

//DEV Handler
try {
  mainTask(inputFilePath, () => {
    console.log('The files are uploaded to s3 bucket successfully!');
  });
} catch (err) {
  console.log(err);
}

function mainTask(inputFilePath) {
  csv()
    .fromFile(inputFilePath)
    .then(async jsonObj => {
      const groupByColumA = groupBy(jsonObj, 'ColumnA'); //lodash.groupby
      const keys = Object.keys(groupByColumA);
      const promises = [];
      keys.forEach(key => {
        jsonexport(groupByColumA[key], (err, csvOutput) => {
          //jsonexport to convert json to csv
          if (err) return console.log(err);
          const csvToCreateFile = removeFirstColumnFromCSV(csvOutput);
          promises.push(putFileToS3Bucket({ csvToCreateFile, key }));
        });
      });
      return Promise.all(promises);
    })
    .catch((err)=>{
      return err;
    })
}

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

function putFileToS3Bucket(uploadData) {
  const { csvToCreateFile, key } = uploadData;
  const s3 = new AWS.S3({ apiVersion: 'latest', region: S3.REGION });
  const params = {
    Body: csvToCreateFile,
    Bucket: S3.BUCKET_NAME,
    Key: key + '.csv'
  };
  return new Promise((resolve,reject)=>{
    s3.putObject(params, function(err, data) {
      if (err) reject(err, err.stack);
      // an error occurred
      else resolve(data); // successful response
    });
  })
}
