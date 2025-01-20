'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // To navigate to the next page
import HtmlContextProvider from '@/context/HtmlContextProvider';
import Image from '@/components/Image';
import Iframe from '@/components/Iframe';
import Editor from '@/components/Editor';
import SubmitButton from '@/components/SubmitButton';
import CompareSlider from '@/components/CompareSlider';

// * types
type PageProps = { params: { id: number } };

const saveToTeamData = async (name: string) => {
  const teamData = {
    name,
    time: new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // To keep the 24-hour format
    }).replace(',', ''),
  };

  try {
    const response = await fetch('/api/saveTeamData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    const result = await response.json();
    return result; // Return the response for further checking in handleStart
  } catch (error) {
    console.error('Error saving data:', error);
    return { message: 'Failed to save data' }; // Return an error message in case of failure
  }
};

const Challenge = ({ params: { id } }: PageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter(); // To navigate to the next page

  // Use effect to check if the team data already exists in localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('teamName');
    if (savedName) {
      setName(savedName); // Set the team name from localStorage
      setLoaded(true); // Set loaded to true if the teamName already exists
    }
  }, []);

  const handleStart = async () => {
    const teamName = name.trim();

    if (teamName) {
      const response = await saveToTeamData(teamName);
      if (response.message === 'Team already exists') {
        alert('Team already exists. Please reenter a new team name.');
        setName(''); // Clear the input field
        localStorage.removeItem('teamName'); // Remove saved name from localStorage
      } else if (response.message === 'Data saved successfully') {
        setLoaded(true);
        localStorage.setItem('teamName', teamName); // Save the team name to localStorage
      } else {
        alert('Error saving data. Please try again.');
      }
    }
  };

  return (
    <>
      {!loaded ? (
        <div className="font-sans flex flex-col items-center justify-center p-5 md:p-10 lg:p-18 border-4 border-color0">
          <h1 className="text-lg lg:text-4xl font-bold mb-4 text-center lg:px-2">🚀TechCraft : Technical Event🚀</h1>
          <h1 className="text-lg lg:text-4xl font-bold mb-4 text-center lg:px-2">⚔️ CSS Battle ⚔️</h1>
          <h2 className="text-lg lg:text-2xl font-semibold mb-4 text-center lg:px-2">Unleash your Design skills in this Epic CSS showdown</h2>
          <ul className="list-disc pl-6 mb-5 text-left lg:text-lg">
            <p className="font-bold text-left">🗒️ Instructions</p>
            <li>You have been given compiler to code.</li>
            <li>An image be given to match the CSS.</li>
            <li>Code HTML and CSS to make the same image provided.</li>
            <li>The closer your guess, the higher your score.</li>
            <li>Qualify based of high score and less time.</li>
            <li>Create 'div' or 'spans' and provide css to it.</li>
          </ul>
          <input
            type="text"
            placeholder="Enter your Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 px-6 border rounded-md mb-4 text-black font-semibold"
          />
          <button
            onClick={handleStart}
            className="bg-blue-500 hover:bg-blue-700 text-white rounded-md p-2 px-4 font-semibold"
          >
            Start Challenge ⏱️
          </button>
        </div>
      ) : (
        <HtmlContextProvider>
          <div className="font-sans flex flex-col justify-center p-5 border-4 border-color0">
          <div className="grid grid-cols-[auto,_450px,_450px] justify-items-center h-fit gap-y-4">
            {/* Titles for each column */}
            <h1 className="text-2xl font-bold mb-2">Editor</h1>
            <h1 className="text-2xl font-bold mb-2">Compare View</h1>
            <h1 className="text-2xl font-bold mb-2">Original Image</h1>

            {/* Content for each column */}
            <Editor />
            <div>
              <CompareSlider items={[<Iframe key="iframe" />, <Image id={id} key="image" />]} />
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div>
                    <h3 className="text-lg font-semibold">Dimensions:</h3>
                    <p className="text-base">Height: 300px</p>
                    <p className="text-base">Width : 400px</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Important Code:</h3>
                    <p className="text-base">Saffron   : #FF671F</p>
                    <p className="text-base">White     : #FFFFFF</p>
                    <p className="text-base">Green     : #046A38</p>
                    <p className="text-base">Navy blue : #06038D</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Image id={id} className="base" />
              <SubmitButton />
            </div>
          </div>
          </div>
        </HtmlContextProvider>
      )}
    </>
  );
};

export default Challenge;
