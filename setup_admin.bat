
@echo off
echo Stopping any potential node processes...
taskkill /F /IM node.exe /T 2>nul
echo.
echo Installing new dependencies...
call npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken
echo.
echo Updating Database Schema...
call npx prisma db push
echo.
echo Seeding Database with Admin User...
call npx ts-node src/scripts/seed.ts
echo.
echo Setup Complete! You can now restart your servers with "npm run dev".
pause
