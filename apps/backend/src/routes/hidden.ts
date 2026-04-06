import { Router, Request, Response } from 'express';
import { HiddenCertificate } from '../models/HiddenCertificate';

const router: import('express').Router = Router();

router.post('/hide', async (req: Request, res: Response) => {
  try {
    const { walletAddress, tokenId } = req.body;
    await HiddenCertificate.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase(), tokenId },
      { walletAddress: walletAddress.toLowerCase(), tokenId },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/unhide', async (req: Request, res: Response) => {
  try {
    const { walletAddress, tokenId } = req.body;
    await HiddenCertificate.deleteOne({ walletAddress: walletAddress.toLowerCase(), tokenId });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const hidden = await HiddenCertificate.find({ walletAddress: wallet.toLowerCase() });
    const hiddenTokenIds = hidden.map((h) => h.tokenId);
    res.json({ hiddenTokenIds });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
