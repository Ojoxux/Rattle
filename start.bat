@echo off
cd /d "%~dp0"
call pnpm run preview -- --host localhost --open
if errorlevel 1 (
  echo.
  echo 起動に失敗しました。上のエラーを確認してください。
  pause
)
