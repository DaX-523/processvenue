import request from "supertest";
import express from "express";
import reviewsRouter from "../../routes/reviews";
import prisma from "../../lib/prisma";

// Create test app
const app = express();
app.use(express.json());
app.use("/books", reviewsRouter);

const mockBook = {
  id: "book-123",
  title: "Test Book",
  author: "Test Author",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReviews = [
  {
    id: "review-1",
    bookId: "book-123",
    name: "John Doe",
    rating: 4,
    comment: "Great book!",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  },
  {
    id: "review-2",
    bookId: "book-123",
    name: "Jane Smith",
    rating: 5,
    comment: null,
    createdAt: new Date("2024-01-02T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  },
];

describe("Reviews API Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /books/:id/reviews", () => {
    it("should return reviews with correct response format", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.reviews.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const response = await request(app).get("/books/book-123/reviews");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(response.body.message).toBe("Reviews fetched successfully");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty("id");
      expect(response.body.data[0]).toHaveProperty("bookId");
      expect(response.body.data[0]).toHaveProperty("name");
      expect(response.body.data[0]).toHaveProperty("rating");
    });

    it("should return empty array when no reviews exist for valid book", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.reviews.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get("/books/book-123/reviews");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("No reviews found for this book");
      expect(response.body.data).toEqual([]);
    });

    it("should return 404 when book does not exist", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(
        "/books/nonexistent-book/reviews"
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toBe("Book not found");
      expect(response.body.error).toBe("The specified book does not exist");
    });

    it("should return 404 for invalid book ID format", async () => {
      const response = await request(app).get("/books//reviews");

      expect(response.status).toBe(404);
      // Express router handles empty path segments as 404, not validation error
    });
  });

  describe("POST /books/:id/reviews", () => {
    const validReview = {
      name: "John Doe",
      rating: 4,
      comment: "Great book!",
    };

    const createdReview = {
      id: "new-review-id",
      bookId: "book-123",
      name: "John Doe",
      rating: 4,
      comment: "Great book!",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create review with correct response format", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.reviews.create as jest.Mock).mockResolvedValue(createdReview);

      const response = await request(app)
        .post("/books/book-123/reviews")
        .send(validReview);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(response.body.message).toBe("Review created successfully");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.name).toBe("John Doe");
      expect(response.body.data.rating).toBe(4);
      expect(response.body.data.comment).toBe("Great book!");
    });

    it("should create review without comment", async () => {
      const reviewWithoutComment = { name: "Jane Doe", rating: 5 };
      const createdReviewNoComment = { ...createdReview, comment: null };

      (prisma.books.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.reviews.create as jest.Mock).mockResolvedValue(
        createdReviewNoComment
      );

      const response = await request(app)
        .post("/books/book-123/reviews")
        .send(reviewWithoutComment);

      expect(response.status).toBe(201);
      expect(response.body.data.comment).toBe(null);
    });

    it("should return 404 when book does not exist", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/books/nonexistent-book/reviews")
        .send(validReview);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Book not found");
      expect(response.body.error).toBe("The specified book does not exist");
    });

    it("should validate required fields", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(mockBook);

      const response = await request(app)
        .post("/books/book-123/reviews")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.error).toBe("Name and rating are required fields");
    });

    it("should validate rating range", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(mockBook);

      const response = await request(app)
        .post("/books/book-123/reviews")
        .send({ name: "John Doe", rating: 6 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.error).toBe("Rating must be between 1 and 5");
    });

    it("should validate name length", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(mockBook);
      const longName = "a".repeat(101);

      const response = await request(app)
        .post("/books/book-123/reviews")
        .send({ name: longName, rating: 4 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.error).toBe("Name must be 100 characters or less");
    });

    it("should validate comment length", async () => {
      (prisma.books.findUnique as jest.Mock).mockResolvedValue(mockBook);
      const longComment = "a".repeat(1001);

      const response = await request(app)
        .post("/books/book-123/reviews")
        .send({ name: "John Doe", rating: 4, comment: longComment });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.error).toBe(
        "Comment must be 1000 characters or less"
      );
    });
  });
});
