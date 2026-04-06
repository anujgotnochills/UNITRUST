import { Request, Response } from 'express';
import { CertificateRecord } from '../models/CertificateRecord';
import { CertificateRequest } from '../models/CertificateRequest';
import { ethers } from 'ethers';
import { env } from '../config/env';

const CERTIFICATE_NFT_ABI = [
  'function mintCertificate(address student, string uri, string requestId) returns (uint256)',
  'event CertificateMinted(uint256 indexed tokenId, address indexed issuer, address indexed student, string requestId, string tokenURI)',
];

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

export async function issueCertificate(req: Request, res: Response): Promise<void> {
  try {
    const { requestId, studentWallet, metadataUri, issuerWallet } = req.body;

    if (!requestId || !studentWallet || !metadataUri) {
      res.status(400).json({ success: false, error: 'requestId, studentWallet, and metadataUri are required' });
      return;
    }

    if (!env.BACKEND_PRIVATE_KEY || !env.ALCHEMY_RPC || !env.CERTIFICATE_NFT_ADDRESS) {
      res.status(500).json({ success: false, error: 'Backend blockchain config missing' });
      return;
    }

    // Find and validate request
    const request = await CertificateRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }
    if (request.status !== 'accepted') {
      res.status(400).json({ success: false, error: `Request must be accepted first. Current status: ${request.status}` });
      return;
    }

    // Mint via backend wallet (which has ISSUER_ROLE)
    const provider = new ethers.JsonRpcProvider(env.ALCHEMY_RPC);
    const signer = new ethers.Wallet(env.BACKEND_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(env.CERTIFICATE_NFT_ADDRESS, CERTIFICATE_NFT_ABI, signer);

    const tx = await contract.mintCertificate(studentWallet, metadataUri, requestId);
    const receipt = await tx.wait();

    // Parse the CertificateMinted event for the tokenId
    const iface = new ethers.Interface(CERTIFICATE_NFT_ABI);
    let tokenId: number | null = null;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
        if (parsed?.name === 'CertificateMinted') {
          tokenId = Number(parsed.args.tokenId);
          break;
        }
      } catch {}
    }

    if (tokenId === null) {
      // Fallback: mark minted without tokenId
      await CertificateRequest.findByIdAndUpdate(requestId, { status: 'minted', txHash: receipt.hash });
      res.json({ success: true, txHash: receipt.hash, tokenId: 'pending' });
      return;
    }

    // Save certificate record
    await CertificateRecord.findOneAndUpdate(
      { tokenId },
      {
        tokenId,
        issuerWallet: (issuerWallet || request.instituteWallet).toLowerCase(),
        holderWallet: studentWallet.toLowerCase(),
        metadataURI: metadataUri,
        txHash: receipt.hash,
        carbonScore: 0,
      },
      { upsert: true, new: true }
    );

    // Update request status
    await CertificateRequest.findByIdAndUpdate(requestId, {
      status: 'minted',
      tokenId,
      txHash: receipt.hash,
    });

    res.json({ success: true, tokenId, txHash: receipt.hash });
  } catch (error: any) {
    console.error('issueCertificate error:', error);
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
