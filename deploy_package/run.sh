#!/bin/bash
# Install dependencies
pip install -r requirements.txt
# Run the server (Host 0.0.0.0 is crucial for external access)
# uvicorn main:app --host 0.0.0.0 --port 8000
# pm2 start main.py --name "god-api" --interpreter ./venv_5090/bin/python
