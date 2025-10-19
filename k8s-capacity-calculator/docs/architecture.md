# K8S Capacity Calculator - Architecture

## Overview
A serverless application for calculating Kubernetes cluster capacity and costs.

## Architecture Diagram
User → S3 Website (Frontend) → API Gateway → Lambda (Backend)

## Components

### Frontend (S3 Static Website)
- **Location**: AWS S3 bucket with static website hosting
- **Technology**: HTML, CSS, JavaScript
- **Features**: 
  - Dynamic form for capacity inputs
  - Real-time calculations
  - Results display

### Backend (AWS Lambda)
- **Runtime**: Python 3.9
- **Handler**: `app.lambda_handler`
- **Dependencies**: Pure Python (no Flask in production)

### API Gateway (HTTP API)
- **Type**: HTTP API (v2)
- **CORS**: Enabled for all origins
- **Routes**:
  - `GET /api/test` - Health check
  - `POST /api/finalize-cost` - Main calculation endpoint
  - `POST /api/add` - Add namespace entry
  - `GET /api/summary` - Get summary

## Data Flow
1. User accesses S3 website URL
2. Frontend loads configuration from S3
3. User fills form and submits
4. Frontend sends request to API Gateway
5. API Gateway triggers Lambda function
6. Lambda processes request and returns results
7. Frontend displays results to user

## Infrastructure as Code
- **Tool**: Terraform
- **Modules**: S3, Lambda, API Gateway, IAM
- **State**: Local (can be migrated to S3 backend)

## Deployment
```bash
./scripts/deploy.sh