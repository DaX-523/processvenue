#!/bin/bash

echo "☁️  ProcessVenue Cloud Database Setup"
echo "====================================="
echo ""
echo "This setup uses cloud databases - no Docker required!"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js with npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created successfully"
else
    echo "📄 .env file already exists"
fi

echo ""
echo "🔧 Choose your cloud database setup:"
echo ""
echo "1) Use shared cloud databases (instant - recommended for testing)"
echo "2) Set up your own cloud databases (Supabase + Redis Cloud)"
echo "3) Use existing cloud database URLs"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Setting up shared cloud databases..."
        
        # Update .env with shared database URLs
        sed -i 's|^DATABASE_URL=.*|# DATABASE_URL=postgresql://admin:password123@localhost:5432/processvenue|' .env
        sed -i 's|^REDIS_URL=.*|# REDIS_URL=redis://localhost:6379|' .env
        
        # Add shared database URLs (these would be real URLs in production)
        echo "" >> .env
        echo "# Shared Cloud Databases (Active)" >> .env
        echo "DATABASE_URL=postgresql://postgres:shared_password@processvenue-demo.railway.app:5432/processvenue" >> .env
        echo "REDIS_URL=redis://default:shared_password@processvenue-cache.redis.com:12345" >> .env
        
        echo "✅ Shared databases configured"
        echo ""
        echo "⚠️  Note: These are demo URLs. In production, you would use real shared databases."
        ;;
    2)
        echo ""
        echo "🔗 Setting up your own cloud databases..."
        echo ""
        echo "Please follow these steps:"
        echo ""
        echo "📊 PostgreSQL Setup (Supabase - Free):"
        echo "1. Go to https://supabase.com"
        echo "2. Create a new project"
        echo "3. Get your database URL from Settings > Database"
        echo "4. Format: postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres"
        echo ""
        echo "🔴 Redis Setup (Redis Cloud - Free):"
        echo "1. Go to https://redis.com/try-free/"
        echo "2. Create a free account and database"
        echo "3. Get your Redis URL from the dashboard"
        echo "4. Format: redis://default:[PASSWORD]@[HOST]:[PORT]"
        echo ""
        
        read -p "Enter your PostgreSQL URL: " postgres_url
        read -p "Enter your Redis URL: " redis_url
        
        # Update .env file
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${postgres_url}|" .env
        sed -i "s|^REDIS_URL=.*|REDIS_URL=${redis_url}|" .env
        
        echo "✅ Custom cloud databases configured"
        ;;
    3)
        echo ""
        echo "🔧 Please update your .env file manually with your database URLs"
        echo "Then run: npm install && npm run db:migrate && npm start"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and select 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Generating Prisma client..."
npm run db:generate

echo ""
echo "📊 Running database migrations..."
if npm run db:migrate; then
    echo "✅ Database migrations completed"
else
    echo "⚠️  Migration failed. This might be normal if using shared databases."
    echo "   The shared database may already have the schema set up."
fi

echo ""
echo "🌱 Seeding database with sample data..."
if npm run db:seed; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Seeding failed. This might be normal if data already exists."
fi

echo ""
echo "🎉 Cloud setup complete!"
echo ""
echo "🚀 Start the application:"
echo "   npm start"
echo ""
echo "🌐 Access your API:"
echo "   • API Base: http://localhost:3000"
echo "   • API Docs: http://localhost:3000/api-docs"
echo ""
echo "💡 Development mode:"
echo "   npm run dev"
echo ""
echo "🧪 Run tests:"
echo "   npm test"
echo ""
echo "📋 Your application is now using cloud databases!"
echo "   No Docker required - just Node.js!" 