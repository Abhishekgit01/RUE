import express from 'express';
import UserProfile from '../models/UserProfile';

const router = express.Router();

// Get profile by userId
router.get('/:userId', async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.params.userId });
    if (!profile) {
      // Create default profile if not exists
      profile = await UserProfile.create({ userId: req.params.userId });
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.patch('/:userId', async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
