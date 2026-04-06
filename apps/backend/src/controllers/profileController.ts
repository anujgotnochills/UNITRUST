import { Request, Response } from 'express';
import { UserProfile } from '../models/UserProfile';
import { InstituteProfile } from '../models/InstituteProfile';

// ---- User Profile ----

export async function createOrUpdateUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const { walletAddress, name, profilePic } = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        walletAddress: walletAddress.toLowerCase(),
        name: name || '',
        profilePic: profilePic || '',
        role: 'user',
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const profile = await UserProfile.findOne({ walletAddress: wallet.toLowerCase() });

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ---- Institute Profile ----

export async function createOrUpdateInstituteProfile(req: Request, res: Response): Promise<void> {
  try {
    const { walletAddress, instituteName, logo } = req.body;

    const profile = await InstituteProfile.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        walletAddress: walletAddress.toLowerCase(),
        instituteName,
        logo: logo || '',
        role: 'institute',
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getInstituteProfile(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const profile = await InstituteProfile.findOne({ walletAddress: wallet.toLowerCase() });

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
