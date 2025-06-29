import { Router, Request, Response } from "express";
import prisma from "../lib/prismaClient";

const router = Router();

router.get("/:id/reviews", async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id;
    const reviews = await prisma.reviews.findMany({
      where: {
        bookId,
      },
    });
    res.status(200).json({
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
});

router.post("/:id/reviews", async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id;
    const { name, rating, comment } = req.body;
    const newReview = await prisma.reviews.create({
      data: {
        bookId,
        name,
        rating,
        comment,
      },
    });
    res.status(201).json({
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
});

export default router;
