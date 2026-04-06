import { Router } from 'express';
import { uploadFile, uploadMetadata } from '../controllers/ipfsController';
import { upload } from '../middleware/upload';

const router: import('express').Router = Router();

router.post('/upload-file', upload.single('file'), uploadFile);
router.post('/upload-metadata', uploadMetadata);

export default router;
