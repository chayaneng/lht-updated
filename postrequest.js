'use strict';
const AWS = require("aws-sdk");
const s3 = new AWS.S3();


// utility function to run lighthouse
const postRequest = async (event) => {
  const blob = 'hug-kiss-images.jpg';


  const uploadedImage = await s3.upload({
    Bucket: 'lighthouse-s3-bucket',
    Key: 'test/hello.txt',
    Body: 'hello world',
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      filename: uploadedImage.Location
    })
  }

};

// do something with runLighthouse
module.exports = {
  handler: postRequest
}