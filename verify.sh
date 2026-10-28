#!/bin/bash

# Verification script to ensure all files are in place

echo "🔍 Checking React Conversion Setup..."
echo ""

errors=0

# Check src directory structure
echo "✓ Checking directory structure..."
if [ -d "src" ]; then
  echo "  ✅ src/ directory exists"
else
  echo "  ❌ src/ directory missing"
  errors=$((errors+1))
fi

# Check key files
echo ""
echo "✓ Checking required files..."

required_files=(
  "src/App.jsx"
  "src/index.jsx"
  "src/index.css"
  "src/pages/Home.jsx"
  "src/pages/Signin.jsx"
  "src/pages/Signup.jsx"
  "src/pages/Dashboard.jsx"
  "src/pages/AuctionPage.jsx"
  "src/pages/CreateRFQ.jsx"
  "src/components/Header.jsx"
  "src/components/AuctionBoard.jsx"
  "src/components/AuctionDetails.jsx"
  "src/components/BidForm.jsx"
  "src/lib/db.js"
  "src/lib/utils.js"
  "src/lib/types.js"
  "index.html"
  "vite.config.js"
  "tailwind.config.js"
  "postcss.config.js"
  "package.json"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    errors=$((errors+1))
  fi
done

# Check documentation
echo ""
echo "✓ Checking documentation..."
docs=(
  "README.md"
  "SETUP.md"
  "QUICKSTART.md"
  "CONVERSION.md"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✅ $doc"
  else
    echo "  ❌ $doc (MISSING)"
    errors=$((errors+1))
  fi
done

# Check node_modules
echo ""
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "  ✅ node_modules/ exists"
  if [ -d "node_modules/react" ]; then
    echo "  ✅ React installed"
  else
    echo "  ❌ React not installed (run: npm install)"
    errors=$((errors+1))
  fi
else
  echo "  ⚠️  node_modules/ not found (run: npm install)"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════"
if [ $errors -eq 0 ]; then
  echo "✅ All checks passed! You're ready to go!"
  echo ""
  echo "Next steps:"
  echo "  1. npm install (if not done)"
  echo "  2. npm run dev"
  echo "  3. Open http://localhost:5173"
else
  echo "❌ Found $errors issue(s) that need fixing"
  echo ""
  echo "Run these commands:"
  echo "  1. npm install"
  echo "  2. npm run dev"
fi
echo "═══════════════════════════════════════════"
