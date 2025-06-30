# 🚀 Quick Start Guide

Get the ProcessVenue API running in under 2 minutes!

## Choose Your Path

### 🐳 Path A: Docker (Easiest)

```bash
git clone <your-repo-url>
cd processvenue-assessment
./setup.sh
# Choose option 1
```

✅ Done! API running at http://localhost:3000

### ☁️ Path B: Cloud Databases (No Docker)

```bash
git clone <your-repo-url>
cd processvenue-assessment
./setup-cloud.sh
# Choose option 1 for shared demo databases
```

✅ Done! API running at http://localhost:3000

### ⚡ Path C: One Command (Super Fast)

```bash
git clone <your-repo-url> && cd processvenue-assessment && chmod +x setup*.sh && ./setup.sh
```

## Test It Works

1. **Open your browser**: http://localhost:3000
2. **API Docs**: http://localhost:3000/api-docs
3. **Get books**: http://localhost:3000/api/books

## Sample API Calls

```bash
# Get all books
curl http://localhost:3000/api/books

# Create a book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"My Book","author":"Me"}'

# Get reviews for a book (use book ID from response above)
curl http://localhost:3000/api/reviews/{book-id}
```

## Need Help?

- 📖 **Full docs**: README.md
- 🐛 **Issues**: Check troubleshooting in README.md
- 💬 **Questions**: Create an issue on GitHub

---

_That's it! You're ready to code! 🎉_
