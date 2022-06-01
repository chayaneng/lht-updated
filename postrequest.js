'use strict';
const lighthouse = require('lighthouse');
const chromium = require('chrome-aws-lambda');

// utility function to run lighthouse
const postRequest = async (event) => {

  let response = null;
  let browser = null;


      browser = await chromium.puppeteer.launch({
          args: [...chromium.args, "--remote-debugging-port=9222"],
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath,
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
      });

      const options = {
          output: "json",
          preset: 'mobile',
          onlyCategories: ["performance"],
          port: 9222,
      }

      const url = 'https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event';

      const result = await lighthouse(url, options);
      console.log(`Audited ${url} in ${result.lhr.timing.total} ms.`);
      response = {
        statusCode: 200,
        body: {
          'time': result.lhr.timing.total
        }
      }

    return response;
};

// do something with runLighthouse
module.exports = {
  handler: postRequest
}