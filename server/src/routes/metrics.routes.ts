import { Router } from "express";
import prisma from '../config/db.config';

const router = Router();

router.get('/metrics', async ( _ , res ) => {
    const response = await prisma.metrics.findMany();
    res.status(200).json(response);
})

router.post('/metrics', async ( req , res ) => {
    const response = await prisma.metrics.create({
        data: req.body
    });
    res.status(200).json(response);
})

export default router;