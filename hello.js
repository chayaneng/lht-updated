'use strict';
const lighthouse = require('lighthouse');
const chromium = require("chrome-aws-lambda")


const runLighthouse = async url => {
  let response = null;
  let browser = null;

  try {
      browser = await chromium.puppeteer.launch({
          args: [...chromium.args, "--disable-dev-shm-usage","--remote-debugging-port=9222"],
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

      const report = result.report;

      response = {
          statusCode: 200,
          body: JSON.stringify(report),
      }
  } catch (error) {
    console.log(error);
  } finally {
      if (browser !== null) {
          await browser.close();
      }
  }

  return response;
};

module.exports = {
  handler: runLighthouse
}