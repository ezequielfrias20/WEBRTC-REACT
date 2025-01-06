import {Router} from "express";
import MetricsRouter from './metrics.routes'

const router = Router();

router.use('/api', MetricsRouter)


export default router;
