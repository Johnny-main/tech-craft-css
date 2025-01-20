import { promisify } from 'util';
import puppeteer from 'puppeteer-core'; // Use puppeteer-core for compatibility with serverless environments
import getPixels from 'get-pixels';
import chromium from '@sparticuz/chromium'; // Import @sparticuz/chromium for serverless compatibility

const execAsync = promisify(exec);

const CLOUD_SHELL_BASE_URL = 'https://cloud-shell.onrender.com';

// Function to read image pixels
const readPixels = async (imagePath: string) => {
  const res = await promisify(getPixels)(imagePath, 'image/png');
  return res.data;
};

// Function to calculate the Mean Squared Error
const meanSquaredError = (a: Uint8Array, b: Uint8Array) => {
  const maxPossibleError = 255 ** 2;
  let error = 0;

  for (let i = 0; i < a.length; i++) {
    error += Math.pow(b[i] - a[i], 2);
  }

  error = error / a.length;
  const errorPercent = (1 - error / maxPossibleError) * 100;

  return parseFloat(errorPercent.toFixed(2));
};

// Function to upload files to Cloud Shell
const uploadToCloudShell = async (fileBuffer: Buffer, fileName: string) => {
  try {
    const formData = new FormData();
    formData.append('filee', new Blob([fileBuffer]), fileName);

    const requestOptions = {
      method: 'POST',
      body: formData,
    };

    const response = await fetch(CLOUD_SHELL_BASE_URL, requestOptions);

    if (response.ok) {
      console.log(`File uploaded successfully: ${fileName}`);
    } else {
      console.error(`Failed to upload file: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error while uploading to Cloud Shell:', error);
  }
};

// Function to take a screenshot and upload directly to Cloud Shell
const takeScreenshot = async (
  id: string,
  html: string,
  selectors: string[],
  fileNames: string[]
) => {
  let browser = null;
  try {
    // Launch Puppeteer with @sparticuz/chromium for Vercel compatibility
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const url = [process.env.PUBLIC_URL, 'screenshot', id].join('/');

    if (!url) {
      throw new Error('invalid url - make sure to set the PUBLIC_URL env properly');
    }

    await page.goto(url);
    await page.$eval('iframe', (e, html) => e.setAttribute('srcdoc', html), html);

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const fileName = fileNames[i]; // Map the filename to the selector
      const element = await page.$(`.${selector}`);

      if (element) {
        const timestamp = new Date();
        const formattedTimestamp = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(timestamp.getSeconds()).padStart(2, '0')}`;

        // Take a screenshot and save it to a buffer (in memory) instead of a file
        const screenshotBuffer = await element.screenshot({ type: 'png' });

        console.log(`Screenshot captured for selector: .${selector}`);

        // Upload the screenshot directly to Cloud Shell
        await uploadToCloudShell(screenshotBuffer, `${formattedTimestamp}-${fileName}.png`);
      } else {
        console.warn(`Selector not found: .${selector}`);
      }
    }

    await browser.close();
  } catch (err) {
    console.error(err);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

export { takeScreenshot, meanSquaredError, readPixels };
