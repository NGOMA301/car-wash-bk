import express from 'express';
import {
  createPackage,
  getAllPackages,
  getPackageById,
  deletePackage,
  updatePackage
} from '../controllers/package.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);


router.post('/', createPackage);
router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.delete('/:id', deletePackage);
router.put('/:id', updatePackage);


export default router;
