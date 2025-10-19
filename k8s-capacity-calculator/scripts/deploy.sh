#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== K8S Capacity Calculator Deployment ===${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

# Package Lambda function
echo -e "${YELLOW}📦 Packaging Lambda function...${NC}"
cd backend
chmod +x package-lambda.sh
./package-lambda.sh

if [ ! -f "lambda_function.zip" ]; then
    echo -e "${RED}❌ Lambda package creation failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Lambda package created successfully${NC}"

# Deploy infrastructure
echo -e "${YELLOW}🏗️  Deploying infrastructure...${NC}"
cd ../infrastructure

echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init

echo -e "${YELLOW}Applying Terraform configuration...${NC}"
terraform apply -auto-approve

# Get deployment outputs
API_URL=$(terraform output -raw api_url)
BUCKET_NAME=$(terraform output -raw s3_bucket_name)
WEBSITE_URL=$(terraform output -raw website_url)

# Update frontend configuration
echo -e "${YELLOW}🔧 Updating frontend configuration...${NC}"
cd ../frontend

cat > assets/config/api-config.json << EOF
{
    "apiUrl": "${API_URL}"
}
EOF

echo -e "${GREEN}✅ API configuration updated${NC}"

# Deploy frontend
echo -e "${YELLOW}🚀 Deploying frontend to S3...${NC}"
aws s3 sync . s3://${BUCKET_NAME} --delete

echo -e "${GREEN}✅ Frontend deployed successfully${NC}"

# Display results
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${GREEN}🌐 Frontend URL: ${WEBSITE_URL}${NC}"
echo -e "${GREEN}🔗 API URL: ${API_URL}${NC}"
echo -e "${GREEN}📦 S3 Bucket: ${BUCKET_NAME}${NC}"
echo ""
echo -e "${YELLOW}Quick test commands:${NC}"
echo "curl \"${API_URL}/api/test\""
echo "curl -X POST \"${API_URL}/api/finalize-cost\" -H \"Content-Type: application/json\" -d '{\"results\": []}'"
echo ""
echo -e "${YELLOW}To destroy the infrastructure later:${NC}"
echo "cd infrastructure && terraform destroy -auto-approve"