@echo off
echo ========================================================
echo        Sen de Gonullu Ol - Baslatma Komutu
echo ========================================================
echo.

echo [1/3] Backend baslatiliyor...
start "Backend API" cmd /k "cd backend && npm run dev"

echo [2/3] Frontend (Web) baslatiliyor...
start "Frontend Web" cmd /k "cd frontend && npm run dev"

echo [3/3] Mobil (Expo) baslatiliyor...
start "Mobil Expo" cmd /k "cd mobil && npm start -- --clear"

echo.
echo ========================================================
echo Tum servisler ayri pencerelerde baslatildi!
echo Projeyi durdurmak isterseniz acilan o pencereleri (cmd) 
echo kapatmaniz yeterlidir.
echo ========================================================
pause
