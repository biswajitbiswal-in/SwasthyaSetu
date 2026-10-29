import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../config/db';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @route   HEAD /api/v1/health
 * @desc    Health check & heartbeat endpoint for offline/online network detection
 * @access  Public
 */
router.all('/', (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Swasthya Setu API Gateway',
    version: '1.0.0',
    database: dbStatus,
  });
});

export default router;
