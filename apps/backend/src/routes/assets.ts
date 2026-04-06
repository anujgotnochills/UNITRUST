import { Router } from 'express';
import { recordAsset, getAssetByTokenId, getAssetsByOwner, updateAssetOwner } from '../controllers/assetController';

const router: import('express').Router = Router();

router.post('/record', recordAsset);
router.get('/:tokenId', getAssetByTokenId);
router.get('/owner/:wallet', getAssetsByOwner);
router.put('/:tokenId/transfer', updateAssetOwner);

export default router;
