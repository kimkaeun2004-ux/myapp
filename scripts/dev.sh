#!/usr/bin/env bash
set -e

PORT=3000

if lsof -ti :"$PORT" >/dev/null 2>&1; then
  echo "포트 ${PORT}을(를) 사용 중인 프로세스를 종료합니다..."
  lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 0.3
fi

exec next dev -p "$PORT"
