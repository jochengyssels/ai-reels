#!/bin/bash

echo "🚀 Setting up environment for AI Instagram Reels Generator"
echo "=========================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env-production.txt .env
    echo "✅ .env file created!"
else
    echo "⚠️  .env file already exists. Skipping creation."
fi

echo ""
echo "🔧 Next steps:"
echo "1. Edit .env file and replace 'your-*' values with actual API keys"
echo "2. Run the following commands to test:"
echo ""
echo "   # Test database connection"
echo "   cd server && DATABASE_URL='postgres://neondb_owner:npg_45cOwziLrlpJ@ep-nameless-fog-adxcc8gp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' npx prisma db push"
echo ""
echo "   # Run database migrations"
echo "   cd server && DATABASE_URL='postgres://neondb_owner:npg_45cOwziLrlpJ@ep-nameless-fog-adxcc8gp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' npx prisma migrate deploy"
echo ""
echo "3. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "   - ENVIRONMENT_SETUP.md"
echo "   - ENV_CHECKLIST.md"
echo "   - DEPLOYMENT.md" 