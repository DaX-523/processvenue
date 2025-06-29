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
    const newBook = await prisma.books.create({
      data: {
        title,
        author,
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
