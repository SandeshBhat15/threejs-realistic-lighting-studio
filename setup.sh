#!/bin/bash
echo "==================================================="
echo "  Three.js Realistic Lighting & Mobile Studio Setup"
echo "==================================================="
echo ""
echo "[1/3] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed! Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[2/3] Installing project dependencies..."
npm install

echo ""
echo "[3/3] Launching Studio Dev Server..."
if command -v open &> /dev/null; then
    open http://localhost:5173/
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173/
fi

npm run dev -- --host
