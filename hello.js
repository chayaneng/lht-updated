'use strict';
const lighthouse = require('lighthouse');
const chromium = require("chrome-aws-lambda");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();


const runLighthouse = async (data) => {
  const requestData = data.queryStringParameters;
  const auditUrl = requestData.url;
  let output = 'html';
  let response = null;
  let browser = null;
  let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i');

  if(pattern.test(auditUrl)) {
    try {
      browser = await chromium.puppeteer.launch({
          args: [...chromium.args, "--disable-dev-shm-usage","--remote-debugging-port=9222"],
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath,
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
      });

      if(requestData.output == 'json') {
        output = 'json';
      }

      const options = {
        output: output,
        preset: 'mobile',
        onlyCategories: ["performance"],
        port: 9222,
      }
      
      const result = await lighthouse(auditUrl, options);
      const report = result.report;

      if (requestData.output == 'json') {
        response = {
          statusCode: 200,
          body: JSON.stringify(report),
        }
      } else {
        let folder    = 'lhr/';
        let userID    = requestData.user_id || 'user-id';
        let fileName  = `${userID}_${(new Date().toJSON().slice(0,10))}.html`;
        let filePath  = folder+userID+'/'+fileName;
        let fileUrl   = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${filePath}`;


        try {
          const uplodedImage = await s3.putObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filePath,
            Body: report,
            ContentType: 'text/html'
          }).promise();

          response = {
            statusCode: 200,
            body: JSON.stringify({
              file: fileUrl,
              message: 'File has been created!'
            })
          }
        } catch(e) {
          response = {
            statusCode: 500,
            body: JSON.stringify({
              message:  e.message
            })
          }
        }        
      }
      
      
    } catch (error) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message
        })
      }
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
  } else {
    response = {
      statusCode: 400,
      body: JSON.stringify({
        error: 'INVALID_URL',
        message: 'The provided URL is invalid!'
      })
    }
  }
    
  return response;
};

module.exports = {
  handler: runLighthouse
}