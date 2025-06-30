#!/bin/bash

echo "🚀 ProcessVenue Assessment Setup Script"
echo "======================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created successfully"
else
    echo "📄 .env file already exists"
fi

# Ask user for setup preference
echo ""
echo "Choose setup option:"
echo "1) Full Docker setup (recommended for beginners)"
echo "2) Development setup (Docker for databases, local Node.js)"
echo "3) Just start databases (for advanced users)"
echo "4) Cloud databases setup (no Docker required)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🐳 Starting full Docker setup..."
        docker-compose down 2>/dev/null || true
        docker-compose up --build -d
        
        echo "⏳ Waiting for services to be ready..."
        sleep 10
        
        echo "🔄 Running database migrations..."
        docker-compose exec app npm run db:migrate
        
        echo "🌱 Seeding database with sample data..."
        docker-compose exec app npm run db:seed 2>/dev/null || echo "ℹ️  Seeding skipped (optional)"
        
        echo ""
        echo "🎉 Setup complete!"
        echo "🌐 API is running at: http://localhost:3000"
        echo "📚 API docs available at: http://localhost:3000/api-docs"
        echo ""
        echo "Useful commands:"
        echo "  docker-compose logs app    # View application logs"
        echo "  docker-compose down        # Stop all services"
        echo "  docker-compose restart app # Restart the application"
        ;;
    2)
        echo "🔧 Starting development setup..."
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml up -d
        
        echo "⏳ Waiting for databases to be ready..."
        sleep 10
        
        if ! command -v npm &> /dev/null; then
            echo "❌ npm is not installed. Please install Node.js first."
            echo "Visit: https://nodejs.org/"
            exit 1
        fi
        
        echo "📦 Installing dependencies..."
        npm install
        
        echo "🔄 Running database migrations..."
        npm run db:migrate
        
        echo "🌱 Seeding database with sample data..."
        npm run db:seed 2>/dev/null || echo "ℹ️  Seeding skipped (optional)"
        
        echo ""
        echo "🎉 Development setup complete!"
        echo "💡 Start the application with: npm run dev"
        echo "🌐 API will be available at: http://localhost:3000"
        echo "📚 API docs will be at: http://localhost:3000/api-docs"
        ;;
    3)
        echo "🗃️  Starting databases only..."
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml up -d
        
        echo ""
        echo "🎉 Databases started!"
        echo "🐘 PostgreSQL: localhost:5432"
        echo "🔴 Redis: localhost:6379"
        echo "💡 You can now run your application locally with: npm run dev"
        ;;
    4)
        echo "☁️  Switching to cloud database setup..."
        echo "🔄 Running cloud setup script..."
        ./setup-cloud.sh
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and select 1, 2, 3, or 4."
        exit 1
        ;;
esac

echo ""
echo "📋 Next steps:"
echo "   • Check the README.md for detailed documentation"
echo "   • Test the API endpoints using the Swagger UI"
echo "   • Run tests with: npm test (if running locally)"
echo ""
echo "❓ Need help? Check the Troubleshooting section in README.md" 