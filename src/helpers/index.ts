import { promisify } from 'util';
import puppeteer from 'puppeteer';
import getPixels from 'get-pixels';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const RENDER_CLOUD_SHELL_BASE_URL = 'https://cloud-shell.onrender.com';

const readPixels = async (imagePath: string) => {
  const res = await promisify(getPixels)(imagePath, 'image/png');
  return res.data;
};

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

const uploadScreenshotToRender = async (filePath: string, fileName: string) => {
  const formData = new FormData();
  formData.append('filee', fs.createReadStream(filePath), fileName);

  const response = await fetch(`${RENDER_CLOUD_SHELL_BASE_URL}/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  console.log(`Uploaded ${fileName} to Render Cloud Shell`);
};

const takeScreenshot = async (
  id: string,
  html: string,
  selectors: string[],
  fileNames: string[]
) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = [process.env.PUBLIC_URL, 'screenshot', id].join('/');

    if (!url) {
      throw Error('invalid url - make sure to set the PUBLIC_URL env properly');
    }

    await page.goto(url);
    await page.$eval('iframe', (e, html) => e.setAttribute('srcdoc', html), html);

    const tempDir = path.join('/tmp', 'screenshots');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const fileName = fileNames[i]; // Map the filename to the selector
      const element = await page.$(`.${selector}`);

      if (element) {
        const timestamp = new Date();
        const formattedTimestamp = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(timestamp.getSeconds()).padStart(2, '0')}`;

        const tempFilePath = path.join(tempDir, `${formattedTimestamp}-${fileName}.png`);
        await element.screenshot({ path: tempFilePath, type: 'png' });

        console.log(`Screenshot saved temporarily: ${tempFilePath}`);

        // Upload the screenshot to Render Cloud Shell
        await uploadScreenshotToRender(tempFilePath, `submissions/${formattedTimestamp}-${fileName}.png`);

        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);
      } else {
        console.warn(`Selector not found: .${selector}`);
      }
    }

    await browser.close();
  } catch (err) {
    console.error(err);
  }
};

export { takeScreenshot, meanSquaredError, readPixels };
