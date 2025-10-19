#!/bin/bash

echo "Installing dependencies..."
pip install -r requirements.txt -t .

echo "Creating deployment package..."
zip -r lambda_function.zip . -x "*.git*" "*.DS_Store" "package-lambda.sh" "__pycache__/*" "*.pyc"

echo "✅ Lambda package created: lambda_function.zip"