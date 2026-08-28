@echo off
title StudyPilot - Push to GitHub
cd /d "C:\Users\mauli\.gemini\antigravity\scratch\studypilot"
echo ========================================================
echo Pushing StudyPilot to https://github.com/Mauliksiwach/studypilot.ai
echo ========================================================
"C:\Users\mauli\AppData\Local\Programs\git\cmd\git.exe" push -u origin main --force
echo.
echo ========================================================
echo Completed! Check your GitHub repo.
echo ========================================================
pause
