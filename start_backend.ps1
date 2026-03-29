# Start VoiceFIR AI Backend
$VENV_PATH = ".\venv\Scripts\activate"
if (Test-Path $VENV_PATH) {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    . $VENV_PATH
    Write-Host "Starting Flask server..." -ForegroundColor Green
    python app.py
} else {
    Write-Host "Virtual environment not found! Please run the setup first." -ForegroundColor Red
}
