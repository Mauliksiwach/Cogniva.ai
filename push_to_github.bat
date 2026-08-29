@echo off
title Cogniva AI - Push to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing Cogniva AI to GitHub...
echo ========================================================
git push -u origin main
echo.
echo ========================================================
echo Push complete!
echo ========================================================
pause
