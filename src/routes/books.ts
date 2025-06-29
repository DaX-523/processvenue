import { Router, Request, Response } from "express";
import prisma from "../lib/prismaClient";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const books = await prisma.books.findMany();
    res.status(200).json({
      message: "Books fetched successfully",
      data: books,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, author } = req.body;

    // Validation checks
    if (!title || !author) {
      return res.status(400).json({
        message: "Validation error",
        error: "Both title and author are required fields",
      });
    }

    if (typeof title !== "string" || typeof author !== "string") {
      return res.status(400).json({
        message: "Validation error",
        error: "Title and author must be strings",
      });
    }

    if (title.trim().length === 0 || author.trim().length === 0) {
      return res.status(400).json({
        message: "Validation error",
        error: "Title and author cannot be empty or contain only whitespace",
      });
    }

    if (title.trim().length > 255 || author.trim().length > 255) {
      return res.status(400).json({
        message: "Validation error",
        error: "Title and author must be 255 characters or less",
      });
    }

    const newBook = await prisma.books.create({
      data: {
        title: title.trim(),
        author: author.trim(),
      },
    });
    res.status(201).json({
      message: "Book created successfully",
      data: newBook,
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
