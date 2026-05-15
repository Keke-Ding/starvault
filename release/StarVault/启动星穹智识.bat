@echo off
chcp 65001 >nul
title 星穹智识 StarVault
echo.
echo   ╔══════════════════════════════════╗
echo   ║     星穹智识  StarVault          ║
echo   ║     二次元风格知识管理工具        ║
echo   ╚══════════════════════════════════╝
echo.
echo   正在启动服务...
echo.
start "" http://localhost:3001
node server-dist/index.js
pause
