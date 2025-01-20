import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Use an absolute path to avoid issues in production environments
const filePath = path.join('/tmp', 'teamdata.json');
interface Team {
  name: string;
  time: string;
}

export async function POST(req: Request) {
  try {
    const data: Team = await req.json();

    // Initialize an empty teamData array if the file doesn't exist
    let teamData: Team[] = [];
    if (fs.existsSync(filePath)) {
      const existingData = fs.readFileSync(filePath, 'utf-8');
      teamData = existingData ? JSON.parse(existingData) : [];
    } else {
      // Create the file if it doesn't exist
      fs.writeFileSync(filePath, JSON.stringify([]));
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

    // Save the updated data to the file
    fs.writeFileSync(filePath, JSON.stringify(teamData, null, 2));

    return NextResponse.json({ message: 'Data saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
