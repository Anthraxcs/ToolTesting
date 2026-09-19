@echo off
title ReceiptVault AI
echo Checking dependencies...

if not exist node_modules (
    echo Installing dependencies for the first time...
    call npm install
)

echo Starting ReceiptVault AI server...
start http://localhost:5173
npm run dev
