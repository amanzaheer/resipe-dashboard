import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
const ensureDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureDir();

    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Failed to upload file' });
      }

      const file = files.image;
      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Generate URL for the uploaded file
      const filename = file.newFilename || file.filename;
      const url = `/uploads/${filename}`;

      res.status(200).json({
        success: true,
        data: {
          url,
          filename: file.originalFilename
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 