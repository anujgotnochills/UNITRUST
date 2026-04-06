import { Request, Response } from 'express';
import { CertificateRecord } from '../models/CertificateRecord';

export async function recordCertificate(req: Request, res: Response): Promise<void> {
  try {
    const { tokenId, issuerWallet, holderWallet, metadataURI, txHash, carbonScore } = req.body;

    const record = await CertificateRecord.findOneAndUpdate(
      { tokenId },
      {
        tokenId,
        issuerWallet: issuerWallet.toLowerCase(),
        holderWallet: holderWallet.toLowerCase(),
        metadataURI,
        txHash,
        carbonScore: carbonScore || 0,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCertificateByTokenId(req: Request, res: Response): Promise<void> {
  try {
    const { tokenId } = req.params;
    const record = await CertificateRecord.findOne({ tokenId: Number(tokenId) });

    if (!record) {
      res.status(404).json({ success: false, error: 'Certificate not found' });
      return;
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCertificatesByHolder(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const certificates = await CertificateRecord.find({ holderWallet: wallet.toLowerCase() }).sort({ createdAt: -1 });

    res.json({ certificates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCertificatesByIssuer(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const certificates = await CertificateRecord.find({ issuerWallet: wallet.toLowerCase() }).sort({ createdAt: -1 });

    res.json({ certificates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
