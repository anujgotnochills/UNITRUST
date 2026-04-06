import { Request, Response } from 'express';
import { uploadFileToPinata, uploadJSONToPinata } from '../services/pinataService';

export async function uploadFile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const result = await uploadFileToPinata(req.file.buffer, req.file.originalname);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function uploadMetadata(req: Request, res: Response): Promise<void> {
  try {
    const metadata = req.body;
    if (!metadata || Object.keys(metadata).length === 0) {
      res.status(400).json({ success: false, error: 'No metadata provided' });
      return;
    }

    const result = await uploadJSONToPinata(metadata, metadata.name || 'metadata');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
