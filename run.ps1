Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "   Starting MyExamPapers.co.uk Local Servers " -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta

# Verify database tables exist
Write-Host "Verifying database tables..." -ForegroundColor Cyan
mysql -u root -proot -e "use myexampapers; show tables;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database not initialized. Executing backend/db_setup.sql..." -ForegroundColor Yellow
    Get-Content backend/db_setup.sql | mysql -u root -proot
} else {
    Write-Host "Database is verified and ready." -ForegroundColor Green
}

# Start backend
Write-Host "Starting Backend Express Server on port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node index.js"

# Start frontend
Write-Host "Starting Frontend React Development Server on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Local servers launched in separate windows." -ForegroundColor Green
Write-Host "Open http://localhost:3000 to view the application." -ForegroundColor Green
Write-Host "Press any key to close this console window..." -ForegroundColor White
Read-Host
