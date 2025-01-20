import { promisify } from 'util';
import getPixels from 'get-pixels';
import { exec } from 'child_process';

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
      body: formData
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

// Function to simulate taking a screenshot based on the provided selector and upload to Cloud Shell
const takeScreenshot = async (
  id: string,
  html: string,
  selectors: string[],
  fileNames: string[]
) => {
  try {
    // Simulating a screenshot logic without Puppeteer
    // Instead of rendering, just simulate the screenshot functionality
    // Possibly by using a static image or calling a third-party service to capture the image

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const fileName = fileNames[i]; // Map the filename to the selector

      // In place of actual Puppeteer screenshot, this is where you would interact with a service 
      // that captures the screenshot or you could use static images or pre-made screenshots.
      // Here, we are simulating a captured buffer.
      
      const simulatedScreenshotBuffer = Buffer.from('fake-image-data', 'utf8'); // Placeholder for actual screenshot data.

      console.log(`Screenshot captured for selector: .${selector}`);

      // Upload the screenshot directly to Cloud Shell
      const timestamp = new Date();
      const formattedTimestamp = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(timestamp.getSeconds()).padStart(2, '0')}`;
      
      // Use formattedTimestamp for the file name
      await uploadToCloudShell(simulatedScreenshotBuffer, `${formattedTimestamp}-${fileName}.png`);
    }
  } catch (err) {
    console.error(err);
  }
};

export { takeScreenshot, meanSquaredError, readPixels };
