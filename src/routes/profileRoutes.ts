// routes/userRoutes.ts
import express from 'express';
import { getAllUserProfiles, getUserProfile, updateUserProfile } from '../controllers/profileController';

const router = express.Router();
router.get('/users/', getAllUserProfiles);
// User profile retrieval endpoint
router.get('/users/:userId/', getUserProfile);

// User profile update endpoint
router.put('/users/:userId/', updateUserProfile);

export default router;
