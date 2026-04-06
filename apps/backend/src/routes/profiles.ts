import { Router } from 'express';
import {
  createOrUpdateUserProfile,
  getUserProfile,
  createOrUpdateInstituteProfile,
  getInstituteProfile,
} from '../controllers/profileController';

const router = Router();

router.post('/user', createOrUpdateUserProfile);
router.get('/user/:wallet', getUserProfile);
router.post('/institute', createOrUpdateInstituteProfile);
router.get('/institute/:wallet', getInstituteProfile);

export default router;
