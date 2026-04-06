import { Request, Response } from 'express';
import { CertificateRequest } from '../models/CertificateRequest';
import { InstituteProfile } from '../models/InstituteProfile';
import { buildCertificateMetadata } from '../services/metadataBuilder';
import { uploadJSONToPinata } from '../services/pinataService';

export async function createRequest(req: Request, res: Response): Promise<void> {
  try {
    const { instituteWallet, userWallet, certificateDetails } = req.body;

    const request = await CertificateRequest.create({
      instituteWallet: instituteWallet.toLowerCase(),
      userWallet: userWallet.toLowerCase(),
      certificateDetails,
      status: 'pending',
    });

    res.status(201).json({ success: true, requestId: request._id, status: 'pending' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function acceptRequest(req: Request, res: Response): Promise<void> {
  try {
    const { requestId } = req.params;

    const request = await CertificateRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }

    if (request.status !== 'pending') {
      res.status(400).json({ success: false, error: `Cannot accept a request with status: ${request.status}` });
      return;
    }

    // Fetch institute profile for logo
    const institute = await InstituteProfile.findOne({ walletAddress: request.instituteWallet });
    const instituteName = institute?.instituteName || 'Unknown Institute';
    const instituteLogo = institute?.logo || '';

    // Build and upload metadata to IPFS
    const metadata = buildCertificateMetadata({
      title: request.certificateDetails.title,
      studentName: request.certificateDetails.studentName,
      course: request.certificateDetails.course,
      issueDate: request.certificateDetails.issueDate,
      certificateType: request.certificateDetails.certificateType,
      issuerWallet: request.instituteWallet,
      instituteName,
      instituteLogo,
      carbonScore: request.certificateDetails.carbonScore || 0,
      sustainabilityTag: request.certificateDetails.sustainabilityTag || 'Green',
      requestId: requestId,
      pdfUri: request.certificateDetails.pdfURI,
    });

    const { metadataUri } = await uploadJSONToPinata(metadata, `cert-${requestId}`);

    request.status = 'accepted';
    request.metadataURI = metadataUri;
    await request.save();

    res.json({ success: true, status: 'accepted', metadataURI: metadataUri });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function rejectRequest(req: Request, res: Response): Promise<void> {
  try {
    const { requestId } = req.params;

    const request = await CertificateRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }

    if (request.status !== 'pending') {
      res.status(400).json({ success: false, error: `Cannot reject a request with status: ${request.status}` });
      return;
    }

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, status: 'rejected' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function markMinted(req: Request, res: Response): Promise<void> {
  try {
    const { requestId } = req.params;
    const { tokenId, txHash } = req.body;

    const request = await CertificateRequest.findByIdAndUpdate(
      requestId,
      { status: 'minted', tokenId, txHash },
      { new: true }
    );

    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }

    res.json({ success: true, status: 'minted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getRequestsByUser(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const requests = await CertificateRequest.find({ userWallet: wallet.toLowerCase() }).sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getRequestsByInstitute(req: Request, res: Response): Promise<void> {
  try {
    const { wallet } = req.params;
    const requests = await CertificateRequest.find({ instituteWallet: wallet.toLowerCase() }).sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllRequests(req: Request, res: Response): Promise<void> {
  try {
    const requests = await CertificateRequest.find({}).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
