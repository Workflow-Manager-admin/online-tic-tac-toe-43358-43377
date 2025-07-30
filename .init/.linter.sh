#!/bin/bash
cd /home/kavia/workspace/code-generation/online-tic-tac-toe-43358-43377/tic_tac_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

