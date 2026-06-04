import { authenticateAdmin } from '../utils/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const auth = await authenticateAdmin(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  const { driveUrl } = req.body;
  if (!driveUrl) return res.status(400).json({ error: 'Missing driveUrl' });

  try {
    // Extract file ID from drive URL
    // Supports: https://drive.google.com/file/d/ID/view, https://drive.google.com/open?id=ID, etc.
    const fileIdMatch = driveUrl.match(/(?:id=|file\/d\/)([^/&?]+)/);
    if (!fileIdMatch || !fileIdMatch[1]) {
      return res.status(400).json({ error: 'Invalid Google Drive URL. Could not extract file ID.' });
    }

    const fileId = fileIdMatch[1];
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const response = await fetch(downloadUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Drive. Status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    
    // Check if the response is actually an image or an HTML page (like a login redirect or virus scan warning)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
       // Drive sometimes returns a "virus scan warning" page for large files.
       // For this implementation, we will throw an error. For full support, a Drive API key is needed.
       throw new Error('Google Drive returned an HTML page instead of an image. Ensure the file is public and under the virus scan size limit (usually ~100MB).');
    }

    // Set appropriate headers and send the raw buffer back
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Drive import error:', error);
    return res.status(500).json({ error: error.message || 'Failed to import from Google Drive' });
  }
}
