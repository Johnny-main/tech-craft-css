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
    <main className="container min-w-[1440px] h-screen text-gray-200 mx-auto pt-10">
      {!loaded ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border border-gray-400 rounded-md mb-4"
          />
          <button
            onClick={handleStart}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2"
          >
            Start Challenge
          </button>
        </div>
      ) : (
        <HtmlContextProvider>
          <div className="grid grid-cols-[auto,_450px,_450px] justify-items-center h-full">
            <Editor />
            <CompareSlider items={[<Iframe key="iframe" />, <Image id={id} key="image" />]} />
            <div>
              <Image id={id} className="base" />
              <SubmitButton />
            </div>
          </div>
        </HtmlContextProvider>
      )}
    </main>
  );
};

export default Challenge;
