import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create sample books
  const booksData = [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { title: "To Kill a Mockingbird", author: "Harper Lee" },
    { title: "1984", author: "George Orwell" },
    { title: "Pride and Prejudice", author: "Jane Austen" },
  ];

  const books: any[] = [];

  for (const bookData of booksData) {
    const existingBook = await prisma.books.findFirst({
      where: { title: bookData.title },
    });

    if (!existingBook) {
      const newBook = await prisma.books.create({
        data: bookData,
      });
      books.push(newBook);
    } else {
      books.push(existingBook);
    }
  }

  const [book1, book2, book3, book4] = books;

  console.log("📚 Created sample books");

  // Create sample reviews
  const reviews = [
    {
      bookId: book1.id,
      name: "Alice Johnson",
      rating: 5,
      comment:
        "A masterpiece of American literature. Fitzgerald's prose is absolutely stunning.",
    },
    {
      bookId: book1.id,
      name: "Bob Smith",
      rating: 4,
      comment:
        "Great symbolism and character development. A bit slow at times but worth the read.",
    },
    {
      bookId: book2.id,
      name: "Carol Davis",
      rating: 5,
      comment:
        "Powerful and moving. A timeless story about justice and morality.",
    },
    {
      bookId: book2.id,
      name: "David Wilson",
      rating: 5,
      comment:
        "Harper Lee's writing is incredible. This book changed my perspective on many things.",
    },
    {
      bookId: book3.id,
      name: "Eve Brown",
      rating: 5,
      comment:
        "Dystopian fiction at its finest. More relevant today than ever before.",
    },
    {
      bookId: book3.id,
      name: "Frank Miller",
      rating: 4,
      comment:
        "Thought-provoking and unsettling. Orwell was truly ahead of his time.",
    },
    {
      bookId: book4.id,
      name: "Grace Taylor",
      rating: 4,
      comment:
        "Witty and romantic. Jane Austen's character development is exceptional.",
    },
  ];

  for (const review of reviews) {
    await prisma.reviews.create({
      data: review,
    });
  }

  console.log("⭐ Created sample reviews");
  console.log("✅ Database seeded successfully!");

  // Log summary
  const totalBooks = await prisma.books.count();
  const totalReviews = await prisma.reviews.count();
  console.log(`📊 Summary: ${totalBooks} books, ${totalReviews} reviews`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
