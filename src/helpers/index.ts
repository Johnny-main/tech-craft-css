import { promisify } from 'util';
import puppeteer from 'puppeteer';
import getPixels from 'get-pixels';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const CLOUD_SHELL_BASE_URL = 'https://cloud-shell.onrender.com';

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

const uploadToCloudShell = async (filePath: string, fileName: string) => {
  try {
    const command = `curl -F "filee=@${filePath}" "${CLOUD_SHELL_BASE_URL}"`;
    console.log(`Uploading ${fileName} to Cloud Shell...`);
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error(`Error uploading file: ${stderr}`);
    } else {
      console.log(`File uploaded successfully: ${stdout}`);
    }
  } catch (error) {
    console.error('Error while uploading to Cloud Shell:', error);
  }
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

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const fileName = fileNames[i]; // Map the filename to the selector
      const element = await page.$(`.${selector}`);

      if (element) {
        const timestamp = new Date();
        const formattedTimestamp = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(timestamp.getSeconds()).padStart(2, '0')}`;
        const filePath = `./${formattedTimestamp}-${fileName}.png`;

        await element.screenshot({ path: filePath, type: 'png' });
        console.log(`Screenshot saved locally: ${filePath}`);

        // Upload the screenshot to Cloud Shell
        await uploadToCloudShell(filePath, `${formattedTimestamp}-${fileName}.png`);
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
