import { NextResponse } from 'next/server';

//const RENDER_CLOUD_SHELL_BASE_URL = 'https://cloud-shell.onrender.com';
const RENDER_CLOUD_SHELL_BASE_URL = '100.29.39.202:8080';

interface Team {
  name: string;
  time: string;
}

export async function POST(req: Request) {
  try {
    const data: Team = await req.json();

    // Fetch the existing data from Render Cloud Shell
    const response = await fetch(`${RENDER_CLOUD_SHELL_BASE_URL}/files/teamdata.json`);
    let teamData: Team[] = [];
    if (response.ok) {
      const existingData = await response.json();
      teamData = existingData || [];
    }

    // Check if the team already exists
    const teamExists = teamData.some((team: Team) => team.name === data.name);
    if (teamExists) {
      return NextResponse.json(
        { message: 'Team already exists' },
        { status: 200 }
      );
    }

    // Append new team to the data
    teamData.push(data);

    // Save the updated data back to Render Cloud Shell
    const formData = new FormData();
    formData.append('filee', new Blob([JSON.stringify(teamData, null, 2)], { type: 'application/json' }), 'teamdata.json');

    const uploadResponse = await fetch(`${RENDER_CLOUD_SHELL_BASE_URL}/`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload JSON to Render Cloud Shell');
    }

    return NextResponse.json({ message: 'Data saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
