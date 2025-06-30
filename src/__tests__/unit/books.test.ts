import request from "supertest";
import express from "express";
import booksRouter from "../../routes/books";
import { isRedisAvailable, deleteCache } from "../../lib/redis";
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

describe("Books API Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /books", () => {
    it("should return books with correct response format", async () => {
      // Mock Redis unavailable (cache miss)
      (isRedisAvailable as jest.Mock).mockResolvedValue(false);
      (prisma.books.findMany as jest.Mock).mockResolvedValue(mockBooks);

      const response = await request(app).get("/books");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(response.body.message).toBe("Books fetched successfully");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty("id");
      expect(response.body.data[0]).toHaveProperty("title");
      expect(response.body.data[0]).toHaveProperty("author");
    });

    it("should handle database errors gracefully", async () => {
      (isRedisAvailable as jest.Mock).mockResolvedValue(false);
      (prisma.books.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/books");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("POST /books", () => {
    const validBook = {
      title: "Test Book",
      author: "Test Author",
    };

    const createdBook = {
      id: "new-book-id",
      title: "Test Book",
      author: "Test Author",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create book with correct response format", async () => {
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (deleteCache as jest.Mock).mockResolvedValue(true);
      (prisma.books.create as jest.Mock).mockResolvedValue(createdBook);

      const response = await request(app).post("/books").send(validBook);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(response.body.message).toBe("Book created successfully");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe("Test Book");
      expect(response.body.data.author).toBe("Test Author");

      // Verify cache invalidation was called
      expect(deleteCache).toHaveBeenCalledWith("books");
    });

    it("should validate required fields", async () => {
      const response = await request(app).post("/books").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toBe("Validation error");
      expect(response.body.error).toBe(
        "Both title and author are required fields"
      );
    });

    it("should validate field types", async () => {
      const response = await request(app)
        .post("/books")
        .send({ title: 123, author: true });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.error).toBe("Title and author must be strings");
    });

    it("should validate empty strings", async () => {
      const response = await request(app)
        .post("/books")
        .send({ title: "   ", author: "" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.error).toBe(
        "Both title and author are required fields"
      );
    });

    it("should validate field length", async () => {
      const longString = "a".repeat(256);
      const response = await request(app)
        .post("/books")
        .send({ title: longString, author: "Valid Author" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.error).toBe(
        "Title and author must be 255 characters or less"
      );
    });

    it("should handle database errors during creation", async () => {
      (isRedisAvailable as jest.Mock).mockResolvedValue(false);
      (prisma.books.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).post("/books").send(validBook);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });
});
