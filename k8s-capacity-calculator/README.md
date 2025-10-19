# K8S Capacity Calculator

A serverless application for calculating Kubernetes cluster capacity and costs.

## Features
- Calculate Kubernetes cluster resource requirements
- Estimate costs based on provisioner tiers
- Support for multiple environments (dev, staging, prod)
- Web-based interface with real-time calculations

## Project Structure

```
k8s-capacity-calculator/
├── backend/                 # Lambda function source code
├── frontend/               # Static web application
├── infrastructure/         # Terraform configuration
├── docs/                   # Documentation
└── scripts/                # Deployment and utility scripts
```

## Quick Start

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform installed

### S3 Backend Setup (Required Before Deployment)

1. **Create S3 Bucket for Terraform State:**
   ```bash
   aws s3 mb s3://your-terraform-state-bucket --region YOUR_REGION
   ```

2. **Enable Versioning:**
   ```bash
   aws s3api put-bucket-versioning \
     --bucket your-terraform-state-bucket \
     --versioning-configuration Status=Enabled
   ```

3. **Configure Backend:**
   Update `infrastructure/main.tf` with your bucket:
   ```hcl
   terraform {
     backend "s3" {
       bucket = "your-terraform-state-bucket"
       key    = "k8s-capacity-calculator/terraform.tfstate"
       region = "YOUR_REGION"
     }
   }
   ```

### Deployment

**Option 1: Using Deployment Script**
```bash
# Clone and deploy
git clone <repository-url>
cd k8s-capacity-calculator
./scripts/deploy.sh
```

**Option 2: Manual Terraform Deployment**
```bash
cd infrastructure

# Configure your region in terraform.tfvars
echo 'aws_region = "YOUR_REGION"' >> terraform.tfvars

# Deploy
terraform init
terraform plan
terraform apply
```

### Post-Deployment

After successful deployment, Terraform will output:
- **Application URL** - Access your deployed application
- **API Gateway URL** - Backend API endpoint
- **Lambda Function** - Backend processing details

## Configuration

Update `infrastructure/terraform.tfvars` for your environment:
```hcl
project_name    = "k8s-capacity-calculator"
environment     = "dev"  # or staging, prod
aws_region      = "YOUR_REGION"  # e.g., ap-southeast-1, us-east-1
```

## Management

**Update Deployment:**
```bash
cd infrastructure
terraform apply
```

**Destroy Resources:**
```bash
cd infrastructure
terraform destroy
```

**Redeploy Lambda (if backend changes):**
```bash
cd backend
./package-lambda.sh
cd ../infrastructure
terraform apply -target=module.lambda_function
```

## Region Support

Deploy to any AWS region supporting:
- Lambda
- API Gateway  
- S3
- IAM

Common regions: `ap-southeast-1`, `us-east-1`, `us-west-2`, `eu-west-1`

## Troubleshooting

- Ensure S3 backend bucket exists before deployment
- Verify AWS CLI has required permissions
- Check all services are available in your chosen region
- Review Terraform outputs for endpoint URLs

For detailed architecture, see `docs/architecture.md`.