import { type NextRequest } from 'next/server';

// * helpers
import { readPixels, takeScreenshot, meanSquaredError } from '@/helpers';
import wrapHtml from '@/helpers/wrapHtml';

// * types
type RequestBody = {html: string;
  teamName?: string; 
};
export const POST = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');

  const errorResponse = { ok: false, status: 500 };
  const body: RequestBody = await req.json();
  const html = wrapHtml(body.html);

  const teamName = body.teamName?.trim().replace(/[^a-zA-Z0-9-_]/g, '_') || 'output'; // Sanitize the team name

  if (!id || !teamName) return Response.json(errorResponse);

  try {
    // Pass the teamName as the filename for one of the selectors
    await takeScreenshot(id, html, ['output'], [teamName]);

    const outputPixels = await readPixels(`public/${teamName}.png`);

  } catch (err) {
    console.error(err);
    return Response.json(errorResponse);
  }
};

