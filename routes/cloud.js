var express = require('express');
var router = express.Router();
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();
const bucketName = 'spechtemp';

router.get('/', async function(req, res, next) {
  const [files] = await storage.bucket(bucketName).getFiles();
  console.log('Files:');
  files.forEach(file => {
    console.log(file.name);
  });
});

router.post('/add', async function(req, res, next) {
  const filename = './public/files/1.txt';

  // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filename, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    // gzip: true,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: 'public, max-age=31536000',
    },
  });

  console.log(`${filename} uploaded to ${bucketName}.`);
});

router.get('/download', async function(req, res, next) {
  const srcFilename = '3.flac';
  const destFilename = './public/files/3.flac';

  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFilename,
  };

  // Downloads the file
  await storage
    .bucket(bucketName)
    .file(srcFilename)
    .download(options);

  console.log(
    `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
  );
});

router.get('/check', function(req, res, next) {
  storage
    .getBuckets()
    .then((results) => {
      const buckets = results[0];

      console.log('Buckets:');
      buckets.forEach((bucket) => {
        console.log(bucket.name);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
})

module.exports = router;
