#!/bin/bash

# Jeop2 - Unified Launcher
# Double-click this file to start both the AI server and game server together.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Load .env to get port configuration
GAME_PORT=8000
AI_PORT=7476

if [ -f ".env" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        line="${line%$'\r'}"
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            val="${BASH_REMATCH[2]}"
            val="${val#"${val%%[![:space:]]*}"}"
            val="${val%"${val##*[![:space:]]*}"}"
            if [[ "$val" =~ ^\".*\"$ ]]; then
                val="${val:1:${#val}-2}"
            elif [[ "$val" =~ ^\'.*\'$ ]]; then
                val="${val:1:${#val}-2}"
            fi
            export "${key}=${val}"
        fi
    done < ".env"
fi

# Use ports from .env or defaults
GAME_PORT=${GAME_PORT:-8735}
AI_PORT=${PORT:-7476}

echo "============================================"
echo "  Jeop2 Game + AI Server Launcher"
echo "============================================"
echo ""

# Kill any existing processes on our ports
echo "Checking for existing services..."
killed=0

for port in $GAME_PORT $AI_PORT; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "  Killing process on port $port (PID: $pid)..."
        kill $pid 2>/dev/null
        sleep 0.5
        # Force kill if still running
        if lsof -ti:$port >/dev/null 2>&1; then
            kill -9 $pid 2>/dev/null
        fi
        killed=1
    fi
done

if [ $killed -eq 1 ]; then
    echo "  Old services stopped."
    sleep 1
else
    echo "  No existing services found."
fi
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is required but not found."
    echo "Please install Node.js from https://nodejs.org and try again."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Using Node.js: $(node --version)"

# Check for Python 3
PYTHON_CMD=""
for cmd in python3.13 python3.12 python3.11 python3.10 python3; do
    if command -v "$cmd" &> /dev/null; then
        PYTHON_CMD=$cmd
        break
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    echo "ERROR: Python 3 is required but not found."
    echo "Please install Python 3 and try again."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Using Python: $PYTHON_CMD"

# Install Node dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "First time setup - installing npm dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: npm install failed"
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo ""
fi

# ============================================
# Start All Services
# ============================================

echo ""
echo "============================================"
echo "  Starting All Services"
echo "============================================"
echo ""

# --- AI Server (Node.js) ---
echo "[1/2] Starting AI Server on :${AI_PORT}..."
node server.js > /tmp/ai_server.log 2>&1 &
AI_PID=$!

# Give AI server a moment to start
sleep 1

# Check if AI server started successfully
if ! kill -0 $AI_PID 2>/dev/null; then
    echo "ERROR: AI Server failed to start. Check /tmp/ai_server.log"
    read -p "Press Enter to exit..."
    exit 1
fi
echo "  AI Server started (PID: $AI_PID)"

# --- Game Server (Python HTTP) ---
echo "[2/2] Starting Game Server on :${GAME_PORT}..."
"$PYTHON_CMD" -m http.server $GAME_PORT > /tmp/game_server.log 2>&1 &
GAME_PID=$!

# Give game server a moment to start
sleep 1

# Check if game server started successfully
if ! kill -0 $GAME_PID 2>/dev/null; then
    echo "ERROR: Game Server failed to start. Check /tmp/game_server.log"
    echo "Stopping AI Server..."
    kill $AI_PID 2>/dev/null
    read -p "Press Enter to exit..."
    exit 1
fi
echo "  Game Server started (PID: $GAME_PID)"

# ============================================
# Display Status & Open Browser
# ============================================

echo ""
echo "============================================"
echo "  All Services Running"
echo "============================================"
echo ""
echo "  Jeop2 Game:    http://localhost:${GAME_PORT}"
echo "  AI Server:     http://localhost:${AI_PORT}"
echo ""
echo "  AI Models: ${OR_MODELS:- 'not configured'}"
echo ""
echo "============================================"
echo ""
echo "Opening Jeop2 in your browser..."
echo "(Close this window or press Ctrl+C to stop all servers)"
echo ""

(sleep 1 && open "http://localhost:${GAME_PORT}") &

# Trap to clean up all child processes
trap 'echo ""; echo "Stopping all servers..."; kill ${AI_PID} ${GAME_PID} 2>/dev/null; exit 0' INT TERM

# Wait indefinitely (until Ctrl+C)
wait
