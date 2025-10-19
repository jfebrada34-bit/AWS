# K8S Capacity Calculator - Architecture

## Overview
A serverless application for calculating Kubernetes cluster capacity and costs.

## Architecture Diagram
```
User → S3 Static Website (Frontend) → API Gateway → Lambda Function (Backend)
```

## Components

### Frontend (S3 Static Website)
- **Location**: AWS S3 bucket with static website hosting
- **Technology**: HTML, CSS, JavaScript
- **Features**: 
  - Dynamic form for capacity inputs
  - Real-time calculations
  - Results display
  - Configuration management via JSON files

### Backend (AWS Lambda)
- **Runtime**: Python 3.9
- **Handler**: `app.lambda_handler`
- **Dependencies**: Pure Python (no external frameworks in production)
- **Location**: `backend/app.py`

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
2. Frontend loads configuration from `/assets/config/` JSON files
3. User fills form with capacity requirements and metadata
4. Frontend sends calculation request to API Gateway
5. API Gateway triggers Lambda function
6. Lambda processes request using calculation logic and returns results
7. Frontend displays cost estimates and resource requirements to user

## Infrastructure as Code
- **Tool**: Terraform
- **Modules**: 
  - S3 Static Site (`modules/s3_static_site`)
  - Lambda Function (`modules/lambda_function`) 
  - API Gateway (`modules/api_gateway`)
- **State**: S3 Backend (configured in `backend.tf`)

## Configuration Management
- **Location**: `frontend/assets/config/`
- **Files**:
  - `calculatorDefaults.json` - Calculation parameters
  - `costMap.json` - Provisioner pricing tiers
  - `defaults.json` - Application defaults and tag requirements
  - `orgMapping.json` - Organization and cost center mappings

## Deployment
```bash
# Using deployment script
./scripts/deploy.sh

# Or manual Terraform deployment
cd infrastructure
terraform init
terraform plan
terraform apply
```

## Security
- IAM roles with least privilege principles
- S3 bucket policies for static site hosting
- API Gateway resource policies
- Lambda execution roles

## Monitoring
- AWS CloudWatch Logs for Lambda functions
- API Gateway access logs
- S3 access logging (optional)