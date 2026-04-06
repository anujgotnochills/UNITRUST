import { Router } from 'express';
import {
  recordCertificate,
  getCertificateByTokenId,
  getCertificatesByHolder,
  getCertificatesByIssuer,
} from '../controllers/certificateController';

const router = Router();

router.post('/record', recordCertificate);
router.get('/:tokenId', getCertificateByTokenId);
router.get('/holder/:wallet', getCertificatesByHolder);
router.get('/issuer/:wallet', getCertificatesByIssuer);

export default router;
