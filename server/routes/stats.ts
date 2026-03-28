import { Router } from 'express';
import { Session } from '../models/Session';
import { SaikiNode } from '../models/SaikiNode';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const sessionCount = await Session.countDocuments();
    const totalNodes = await SaikiNode.countDocuments();
    
    // Additional stats for the drawer could be queried here
    
    res.json({ sessionCount, totalNodes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
