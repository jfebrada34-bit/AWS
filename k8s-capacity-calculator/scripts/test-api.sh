#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Testing K8S Calculator API${NC}"

# Get API URL from Terraform output
API_URL=$(terraform -chdir=infrastructure output -raw api_url 2>/dev/null)

if [ -z "$API_URL" ]; then
    echo -e "${RED}❌ Could not get API URL. Make sure infrastructure is deployed.${NC}"
    echo -e "${YELLOW}You can manually set the API URL:${NC}"
    echo "export API_URL=https://your-api-url.execute-api.region.amazonaws.com"
    exit 1
fi

echo -e "${GREEN}API URL: ${API_URL}${NC}"
echo ""

# Test 1: Basic API test
echo -e "${YELLOW}1. Testing /api/test endpoint...${NC}"
response=$(curl -s -w "HTTP_STATUS:%{http_code}" "${API_URL}/api/test")
body=$(echo "$response" | sed -e 's/HTTP_STATUS\:.*//g')
status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ Success: $body${NC}"
else
    echo -e "${RED}❌ Failed: Status $status${NC}"
    echo "Response: $body"
fi

echo ""

# Test 2: CORS test
echo -e "${YELLOW}2. Testing CORS headers...${NC}"
response=$(curl -s -I -X OPTIONS "${API_URL}/api/test" | grep -i "access-control")
if [[ $response == *"access-control"* ]]; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    echo "$response"
else
    echo -e "${RED}❌ CORS headers missing${NC}"
fi

echo ""

# Test 3: Finalize cost endpoint
echo -e "${YELLOW}3. Testing /api/finalize-cost endpoint...${NC}"
test_data='{
  "results": [
    {
      "env": "dev",
      "pods": 3,
      "cpu_req": 500,
      "provisioner": "Tier1",
      "cluster": "test-cluster",
      "pdb": "minUnavailable=1",
      "eks_version": "v1.32"
    }
  ]
}'

response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X POST "${API_URL}/api/finalize-cost" \
  -H "Content-Type: application/json" \
  -d "$test_data")
body=$(echo "$response" | sed -e 's/HTTP_STATUS\:.*//g')
status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ Success: Finalize cost endpoint working${NC}"
    echo "Response: $body"
else
    echo -e "${RED}❌ Failed: Status $status${NC}"
    echo "Response: $body"
fi

echo ""
echo -e "${GREEN}✅ API testing completed${NC}"