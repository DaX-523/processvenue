import express from "express";
import cors from "cors";
import booksRouter from "./routes/books";
import reviewsRouter from "./routes/reviews";
import {
  specs,
  swaggerDocument,
  swaggerUi,
  swaggerUiOptions,
} from "./lib/swagger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerUiOptions)
);

app.use("/books", booksRouter);
app.use("/books", reviewsRouter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Book Review API is running!",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found",
    },
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Book Review API ready!`);
});
