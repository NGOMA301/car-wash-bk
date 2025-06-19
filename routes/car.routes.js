import express from 'express';
import {
  createCar,
  getAllCars,
  getCarById,
  deleteCar,
  updateCar
} from '../controllers/car.controller.js';
import upload from '../middleware/upload.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);


router.post('/', upload.single('image'), createCar);
router.get('/', getAllCars);
router.get('/:id', getCarById);
router.delete('/:id', deleteCar);
router.put('/:id', upload.single('image'), updateCar);


export default router;
