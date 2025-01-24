'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import html2canvas from 'html2canvas'; // Import html2canvas for screenshot functionality

// * hooks
import { useHtmlContext } from '@/context/HtmlContextProvider';

// * components
import Modal from '@/components/Modal';

const SubmitButton = () => {
  const [similarityPercent, setSimilarityPercent] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const { html } = useHtmlContext();
  const teamName = localStorage.getItem('teamName');
  const router = useRouter();

  // Function to capture screenshot and upload
  const captureAndUploadScreenshot = async () => {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;

    try {
      // Capture screenshot of iframe content
      const canvas = await html2canvas(iframe.contentWindow?.document.body!, {
        width: 400,   // Set width to 400px
        height: 300,  // Set height to 300px
        x: 0,         // Optional: Set the x-offset if needed
        y: 0,         // Optional: Set the y-offset if needed
        scale: 1,     // Optional: Maintain scaling ratio (1 for original size)
      });

      const dataUrl = canvas.toDataURL('image/png');

      // Convert base64 image to a Blob
      const byteString = atob(dataUrl.split(',')[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: 'image/png' });

      // Get current date and time in IST (Indian Standard Time)
      const now = new Date();
      const istOffset = 5.5 * 60; // IST is UTC +5:30
      const istDate = new Date(now.getTime() + istOffset * 60000); // Convert to IST

      // Format date and time
      const date = istDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const time = istDate.toISOString().split('T')[1].slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
      const fileName = `${date}_${time}_${teamName || 'default'}.png`; // Create file name

      // Upload the Blob to the cloud server
      const formData = new FormData();
      formData.append('filee', blob, fileName);

      const response = await fetch('100.29.39.202:8080/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Screenshot uploaded successfully');
      } else {
        console.error('Failed to upload screenshot');
      }
    } catch (error) {
      console.error('Error capturing or uploading screenshot:', error);
    }
  };

  const clickHandler = async () => {
    setLoading(true);

    // Capture and upload screenshot before logout
    await captureAndUploadScreenshot();

    router.push('/logout'); // Navigate to logout after the screenshot is uploaded

    

    setLoading(false);
  };

  return (
    <div className='flex items-center justify-center'>
      <button
        type="button"
        disabled={loading}
        onClick={clickHandler}
        className="w-1/2 items-center bg-orange-500 hover:bg-orange-600 disabled:bg-orange-600/50 rounded-md p-2 mt-12 font-semibold"
      >
        Submit
        <Modal isOpen={similarityPercent !== undefined}>
          <div className="text-xl text-orange-500 font-bold">Congrats !!!</div>
          <p className="mt-3">
            You finished the challenge with
            <span className="text-orange-500 font-bold mx-1">{similarityPercent}%</span>
            similarity. 😊
          </p>
        </Modal>
      </button>
    </div>
  );
};

export default SubmitButton;
