import { Request, Response } from 'express';
import { AssetRecord } from '../models/AssetRecord';
import { normalizeCarbonData } from '../services/carbonService';

export async function recordAsset(req: Request, res: Response): Promise<void> {
  try {
    const { tokenId, ownerWallet, metadataURI, txHash, assetName, category } = req.body;

    // Server-side carbon calculation — never trust the client
    const carbonData = normalizeCarbonData(assetName || '', category || 'Other');

    const record = await AssetRecord.findOneAndUpdate(
      { tokenId },
      {
        tokenId,
        ownerWallet: ownerWallet.toLowerCase(),
        metadataURI,
        txHash,
        carbonScore: carbonData.carbonScore,
        sustainabilityTag: carbonData.sustainabilityTag,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      record,
      carbonMatch: {
        label: carbonData.matchedLabel,
        source: carbonData.matchSource,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAssetByTokenId(req: Request, res: Response): Promise<void> {
  try {
    const { tokenId } = req.params;
    const record = await AssetRecord.findOne({ tokenId: Number(tokenId) });

    if (!record) {
      res.status(404).json({ success: false, error: 'Asset not found' });
      return;
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAssetsByOwner(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const assets = await AssetRecord.find({ ownerWallet: wallet.toLowerCase() }).sort({ createdAt: -1 });

    res.json({ assets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateAssetOwner(req: Request, res: Response): Promise<void> {
  try {
    const { tokenId } = req.params;
    const { newOwnerWallet, txHash } = req.body;

    const record = await AssetRecord.findOneAndUpdate(
      { tokenId: Number(tokenId) },
      { ownerWallet: newOwnerWallet.toLowerCase(), txHash },
      { new: true }
    );

    if (!record) {
      res.status(404).json({ success: false, error: 'Asset not found' });
      return;
    }

    res.json({ success: true, record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
