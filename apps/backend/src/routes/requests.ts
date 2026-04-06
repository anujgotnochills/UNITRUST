import { Router } from 'express';
import {
  createRequest,
  acceptRequest,
  rejectRequest,
  markMinted,
  getRequestsByUser,
  getRequestsByInstitute,
  getAllRequests,
} from '../controllers/requestController';

const router: import('express').Router = Router();

router.post('/create', createRequest);
router.put('/:requestId/accept', acceptRequest);
router.put('/:requestId/reject', rejectRequest);
router.put('/:requestId/minted', markMinted);
router.get('/all', getAllRequests);
router.get('/user/:wallet', getRequestsByUser);
router.get('/institute/:wallet', getRequestsByInstitute);

export default router;
