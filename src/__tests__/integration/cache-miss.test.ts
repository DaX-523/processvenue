import request from "supertest";
import express from "express";
import booksRouter from "../../routes/books";
import {
  getCache,
  isRedisAvailable,
  setCache,
  deleteCache,
} from "../../lib/redis";
import prisma from "../../lib/prisma";

// Create test app
const app = express();
app.use(express.json());
app.use("/books", booksRouter);

const mockBooks = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    title: "1984",
    author: "George Orwell",
    createdAt: new Date("2024-01-02T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  },
];

describe("Cache Miss Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /books - Cache Hit Scenarios", () => {
    it("should return cached data when cache hit occurs", async () => {
      const cachedBooksData = JSON.stringify(mockBooks);

      // Mock Redis available and cache hit
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (getCache as jest.Mock).mockResolvedValue(cachedBooksData); // Cache hit!

      const response = await request(app).get("/books");

      // Verify correct response format from cache
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Books fetched successfully");
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe("The Great Gatsby");
      expect(response.body.data[1].title).toBe("1984");

      // Verify cache was used
      expect(isRedisAvailable).toHaveBeenCalled();
      expect(getCache).toHaveBeenCalledWith("books");

      // Verify database was NOT called (performance benefit)
      expect(prisma.books.findMany).not.toHaveBeenCalled();

      // Verify cache was NOT updated (no need since it was a hit)
      expect(setCache).not.toHaveBeenCalled();
    });

    it("should handle cached data with different book collections", async () => {
      const differentBooks = [
        {
          id: "book-999",
          title: "Cached Book 1",
          author: "Cache Author 1",
          createdAt: new Date("2024-01-03T00:00:00.000Z"),
          updatedAt: new Date("2024-01-03T00:00:00.000Z"),
        },
      ];
      const cachedData = JSON.stringify(differentBooks);

      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (getCache as jest.Mock).mockResolvedValue(cachedData);

      const response = await request(app).get("/books");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("Cached Book 1");

      // Verify only cache operations, no database
      expect(getCache).toHaveBeenCalled();
      expect(prisma.books.findMany).not.toHaveBeenCalled();
    });

    it("should handle empty cached array correctly", async () => {
      const emptyCache = JSON.stringify([]);

      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (getCache as jest.Mock).mockResolvedValue(emptyCache);

      const response = await request(app).get("/books");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Books fetched successfully");
      expect(response.body.data).toEqual([]);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify cache hit (even for empty array)
      expect(prisma.books.findMany).not.toHaveBeenCalled();
    });
  });

  describe("GET /books - Cache Miss Scenarios", () => {
    it("should fetch from database when Redis is unavailable", async () => {
      // Mock Redis as unavailable
      (isRedisAvailable as jest.Mock).mockResolvedValue(false);
      (prisma.books.findMany as jest.Mock).mockResolvedValue(mockBooks);

      const response = await request(app).get("/books");

      // Verify correct response format
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(response.body.message).toBe("Books fetched successfully");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);

      // Verify cache operations were not attempted
      expect(getCache).not.toHaveBeenCalled();
      expect(setCache).not.toHaveBeenCalled();

      // Verify database was queried
      expect(prisma.books.findMany).toHaveBeenCalledWith();
    });

    it("should fetch from database when cache miss occurs (Redis available)", async () => {
      // Mock Redis available but cache miss
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (getCache as jest.Mock).mockResolvedValue(null); // Cache miss
      (setCache as jest.Mock).mockResolvedValue(true);
      (prisma.books.findMany as jest.Mock).mockResolvedValue(mockBooks);

      const response = await request(app).get("/books");

      // Verify correct response format
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Books fetched successfully");
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe("The Great Gatsby");
      expect(response.body.data[1].title).toBe("1984");

      // Verify cache miss flow
      expect(isRedisAvailable).toHaveBeenCalled();
      expect(getCache).toHaveBeenCalledWith("books");
      expect(prisma.books.findMany).toHaveBeenCalled();
      expect(setCache).toHaveBeenCalledWith(
        "books",
        JSON.stringify(mockBooks),
        300
      );
    });

    it("should handle cache read errors gracefully and fallback to database", async () => {
      // Mock Redis available but cache read throws error
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (getCache as jest.Mock).mockRejectedValue(
        new Error("Redis connection error")
      );
      (setCache as jest.Mock).mockResolvedValue(true);
      (prisma.books.findMany as jest.Mock).mockResolvedValue(mockBooks);

      const response = await request(app).get("/books");

      // Should still work despite cache error
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Books fetched successfully");
      expect(response.body.data).toHaveLength(2);

      // Verify database was called as fallback
      expect(prisma.books.findMany).toHaveBeenCalled();
      expect(getCache).toHaveBeenCalled();
    });

    it("should handle cache write errors gracefully after successful database fetch", async () => {
      // Mock Redis available, cache miss, but write error
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (getCache as jest.Mock).mockResolvedValue(null); // Cache miss
      (setCache as jest.Mock).mockRejectedValue(new Error("Redis write error"));
      (prisma.books.findMany as jest.Mock).mockResolvedValue(mockBooks);

      const response = await request(app).get("/books");

      // Should still work despite cache write error
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Books fetched successfully");
      expect(response.body.data).toHaveLength(2);

      // Verify both cache read and write were attempted
      expect(getCache).toHaveBeenCalled();
      expect(setCache).toHaveBeenCalled();
      expect(prisma.books.findMany).toHaveBeenCalled();
    });
  });

  describe("POST /books - Cache Invalidation Integration", () => {
    it("should invalidate cache after creating a new book", async () => {
      const newBook = { title: "New Book", author: "New Author" };
      const createdBook = {
        id: "new-book-id",
        title: "New Book",
        author: "New Author",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock successful book creation and cache invalidation
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (deleteCache as jest.Mock).mockResolvedValue(true);
      (prisma.books.create as jest.Mock).mockResolvedValue(createdBook);

      const response = await request(app).post("/books").send(newBook);

      // Verify correct response format
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Book created successfully");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe("New Book");

      // Verify cache invalidation was called
      expect(deleteCache).toHaveBeenCalledWith("books");
      expect(isRedisAvailable).toHaveBeenCalled();
    });

    it("should still create book if cache invalidation fails", async () => {
      const newBook = { title: "New Book", author: "New Author" };
      const createdBook = {
        id: "new-book-id",
        title: "New Book",
        author: "New Author",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock successful book creation but cache invalidation fails
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (deleteCache as jest.Mock).mockRejectedValue(
        new Error("Cache delete error")
      );
      (prisma.books.create as jest.Mock).mockResolvedValue(createdBook);

      const response = await request(app).post("/books").send(newBook);

      // Should still succeed despite cache error
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Book created successfully");
      expect(response.body.data.title).toBe("New Book");

      // Verify cache invalidation was attempted
      expect(deleteCache).toHaveBeenCalledWith("books");
    });
  });
});
