'use strict';
import AWS from 'aws-sdk'
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});



const imageURL = 'https://www.shaadidukaan.com/vogue/wp-content/uploads/2019/08/hug-kiss-images.jpg';
const res = await fetch(imageURL);
const blob = await res.buffer();


const uploadedImage = await s3.upload({
Bucket: process.env.AWS_S3_BUCKET_NAME,
Key: req.files[0].originalFilename,
Body: blob,
}).promise(); 

console.log(uploadedImage.location);