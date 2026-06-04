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

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GOOGLE_DRIVE_API_KEY environment variable is not set. Please add it to Vercel to enable folder imports.' 
    });
  }

  try {
    // Extract folder ID from drive URL
    // Supports: https://drive.google.com/drive/folders/ID, etc.
    const folderIdMatch = driveUrl.match(/folders\/([^/&?]+)/);
    if (!folderIdMatch || !folderIdMatch[1]) {
      return res.status(400).json({ error: 'Invalid Google Drive Folder URL. Could not extract folder ID.' });
    }

    const folderId = folderIdMatch[1];
    
    // Query Google Drive API to list all images in this folder
    const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
    const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${apiKey}&fields=files(id,name,mimeType)&pageSize=100`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('Google Drive API Error:', data);
      throw new Error(data.error?.message || 'Failed to fetch folder contents from Google Drive API.');
    }

    if (!data.files || data.files.length === 0) {
      return res.status(404).json({ error: 'No images found in this folder. Make sure the folder is public ("Anyone with the link can view").' });
    }

    // Return the list of file objects { id, name, mimeType }
    return res.status(200).json({ files: data.files });
    
  } catch (error) {
    console.error('Drive folder import error:', error);
    return res.status(500).json({ error: error.message || 'Failed to import folder from Google Drive' });
  }
}
