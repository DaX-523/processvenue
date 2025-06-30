import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/:id/reviews", async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id;

    if (!bookId || typeof bookId !== "string" || bookId.trim().length === 0) {
      return res.status(400).json({
        message: "Validation error",
        error: "Invalid book ID format",
      });
    }

    const bookExists = await prisma.books.findUnique({
      where: { id: bookId },
    });

    if (!bookExists) {
      return res.status(404).json({
        message: "Book not found",
        error: "The specified book does not exist",
      });
    }

    const reviews = await prisma.reviews.findMany({
      where: {
        bookId,
      },
    });

    res.status(200).json({
      message:
        reviews.length > 0
          ? "Reviews fetched successfully"
          : "No reviews found for this book",
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

    if (!bookId || typeof bookId !== "string" || bookId.trim().length === 0) {
      return res.status(400).json({
        message: "Validation error",
        error: "Invalid book ID format",
      });
    }

    const bookExists = await prisma.books.findUnique({
      where: { id: bookId },
    });

    if (!bookExists) {
      return res.status(404).json({
        message: "Book not found",
        error: "The specified book does not exist",
      });
    }

    if (!name || rating === undefined || rating === null) {
      return res.status(400).json({
        message: "Validation error",
        error: "Name and rating are required fields",
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        message: "Validation error",
        error: "Name must be a string",
      });
    }

    if (name.trim().length === 0) {
      return res.status(400).json({
        message: "Validation error",
        error: "Name cannot be empty or contain only whitespace",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        message: "Validation error",
        error: "Name must be 100 characters or less",
      });
    }

    if (typeof rating !== "number" || !Number.isInteger(rating)) {
      return res.status(400).json({
        message: "Validation error",
        error: "Rating must be an integer",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Validation error",
        error: "Rating must be between 1 and 5",
      });
    }

    if (comment !== undefined && comment !== null) {
      if (typeof comment !== "string") {
        return res.status(400).json({
          message: "Validation error",
          error: "Comment must be a string",
        });
      }

      if (comment.trim().length === 0) {
        return res.status(400).json({
          message: "Validation error",
          error: "Comment cannot be empty or contain only whitespace",
        });
      }

      if (comment.trim().length > 1000) {
        return res.status(400).json({
          message: "Validation error",
          error: "Comment must be 1000 characters or less",
        });
      }
    }

    const newReview = await prisma.reviews.create({
      data: {
        bookId,
        name: name.trim(),
        rating,
        comment: comment ? comment.trim() : null,
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
