import { Router } from 'express';
import {
  recordCertificate,
  issueCertificate,
  getCertificateByTokenId,
  getCertificatesByHolder,
  getCertificatesByIssuer,
} from '../controllers/certificateController';

const router: import('express').Router = Router();

router.post('/record', recordCertificate);
router.post('/issue', issueCertificate);
router.get('/holder/:wallet', getCertificatesByHolder);
router.get('/issuer/:wallet', getCertificatesByIssuer);
router.get('/:tokenId', getCertificateByTokenId);

export default router;
