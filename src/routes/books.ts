import { Router, Request, Response } from "express";
import prisma from "../lib/prismaClient";
import {
  getCache,
  isRedisAvailable,
  setCache,
  deleteCache,
} from "../lib/redis";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    //cache key for redis cache
    const cacheKey = "books";

    // Try to get from cache first
    let cachedBooks = null;
    let fromCache = false;
    if (await isRedisAvailable()) {
      try {
        cachedBooks = await getCache(cacheKey);
        if (cachedBooks) {
          fromCache = true;
          console.log("📦 Serving books from cache");
          return res.status(200).json({
            message: "Books fetched successfully",
            data: JSON.parse(cachedBooks),
          });
        }
      } catch (error) {
        console.error("Cache read error, falling back to database:", error);
      }
    } else {
      console.log("⚠️ Redis not available, fetching from database");
    }
    const books = await prisma.books.findMany();
    if (await isRedisAvailable()) {
      try {
        await setCache(cacheKey, JSON.stringify(books), 300);
        console.log("💾 Books cached successfully");
      } catch (error) {
        console.error("Cache write error:", error);
      }
    }
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
    console.log("💾 Book created successfully");
    console.log("Invalidating books cache...");
    // Invalidate the books cache after creating a new book
    if (await isRedisAvailable()) {
      try {
        await deleteCache("books");
        console.log("🗑️ Books cache invalidated after creating new book");
      } catch (error) {
        console.error("Cache invalidation error:", error);
      }
    }

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
