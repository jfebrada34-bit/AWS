# K8S Capacity Calculator

A serverless application designed for calculating Kubernetes cluster capacity and costs, built to meet specific client requirements for resource planning and cost estimation.

> **Important Note**: This application is designed for a specific project environment and may not work out-of-the-box in your environment. The calculations, cost mappings, and organizational structures are customized for the original client's requirements.

## Project Structure

```
k8s-capacity-calculator/
│
├── backend/                           # Lambda function source code
│   │   app.py                        # Main Lambda handler
│   │   __init__.py                   # Python package initialization
│   │   package-lambda.sh             # Lambda packaging script
│   │   requirements.txt              # Python dependencies
│   │
│   └── utils/                        # Calculation utilities
│           calculator.py             # Core calculation logic
│           config_loader.py          # Configuration loading
│           __init__.py               # Package initialization
│
├── docs/                             # Documentation
│       architecture.md               # System architecture
│       deployment-guide.md           # Detailed deployment instructions
│
├── frontend/                         # Static web application
│   │   index.html                    # Main application interface
│   │
│   └── assets/
│       ├── config/                   # Application configuration
│       │       calculatorDefaults.json  # Default calculation parameters
│       │       costMap.json          # Provisioner cost mappings
│       │       defaults.json         # Application defaults and tag requirements
│       │       orgMapping.json       # Organization and cost center mapping
│       │
│       ├── css/                      # Stylesheets
│       │       style.css             # Main stylesheet
│       │
│       └── js/                       # JavaScript application logic
│               calculator.js         # Main calculator controller
│               calculatorCore.js     # Core calculation functions
│               configLoader.js       # Configuration loading utilities
│               defaults.js           # Default values management
│               finalizeModal.js      # Results modal handling
│               main.js               # Application initialization
│               orgmapping.js         # Organization mapping logic
│               tagsManager.js        # Tag management utilities
│               uiRenderer.js         # UI rendering functions
│
├── infrastructure/                   # Terraform configuration
│   │   backend.tf                    # Terraform S3 backend configuration
│   │   main.tf                       # Main infrastructure definitions
│   │   outputs.tf                    # Terraform output variables
│   │   providers.tf                  # Terraform provider configurations
│   │   terraform.tfvars              # Terraform variable values
│   │   variables.tf                  # Terraform input variables
│   │
│   └── modules/                      # Reusable Terraform modules
│       ├── api_gateway/              # API Gateway module
│       │       main.tf               # API Gateway resources
│       │       outputs.tf            # Module outputs
│       │       variables.tf          # Module variables
│       │
│       ├── lambda_function/          # Lambda function module
│       │   │   main.tf               # Lambda resources
│       │   │   outputs.tf            # Module outputs
│       │   │   variables.tf          # Module variables
│       │   │
│       │   └── lambda_package/       # Lambda deployment package
│       │           k8s-capacity-backend.zip  # Packaged Lambda function
│       │
│       └── s3_static_site/           # S3 static website module
│               main.tf               # S3 resources
│               outputs.tf            # Module outputs
│               variables.tf          # Module variables
│
└── scripts/                          # Deployment and utility scripts
        deploy.sh                     # Automated deployment script
        test-api.sh                   # API testing script
```

## Features
- **Resource Calculation**: Calculate Kubernetes cluster resource requirements based on workload specifications
- **Cost Estimation**: Estimate infrastructure costs across different provisioner tiers and instance types
- **Multi-Environment Support**: Support for development, staging, and production environments with separate configurations
- **Real-time Web Interface**: Web-based interface with instant calculations and dynamic updates
- **Assessment Compliance**: Built-in tagging and description fields to fulfill Under Assessment ticket requirements
- **Organization Mapping**: Configurable organization and department mapping for cost allocation

## Configuration Management

### Customizing Application Settings

All default configurations can be modified through the frontend config files located at:
`frontend/assets/config/`

#### Configuration Files:

1. **`calculatorDefaults.json`** - Default calculation parameters
2. **`costMap.json`** - Provisioner tier pricing
3. **`defaults.json`** - Application defaults and tag requirements
4. **`orgMapping.json`** - Organization and cost center mapping

### How to Update Configurations

1. **Edit Configuration Files:**
   ```bash
   # Navigate to config directory
   cd frontend/assets/config/
   
   # Edit the desired JSON files to match your environment
   nano calculatorDefaults.json
   nano costMap.json
   nano defaults.json  
   nano orgMapping.json
   ```

2. **Redeploy After Changes:**
   ```bash
   cd infrastructure
   terraform apply
   ```

## Quick Start

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform installed

### S3 Backend Setup (Required Before Deployment)

1. **Create S3 Bucket for Terraform State:**
   ```bash
   aws s3 mb s3://your-tf-state-bucket --region your-preferred-region
   ```

2. **Enable Versioning:**
   ```bash
   aws s3api put-bucket-versioning \
     --bucket your-tf-state-bucket \
     --versioning-configuration Status=Enabled
   ```

3. **Update Terraform Backend Configuration:**
   
   Edit `infrastructure/backend.tf` with your bucket details:
   ```hcl
   terraform {
     backend "s3" {
       bucket = "your-tf-state-bucket"
       key    = "k8s-capacity-calculator/terraform.tfstate"
       region = "your-preferred-region"
     }
   }
   ```

### Deployment

**Option 1: Using Deployment Script**
```bash
./scripts/deploy.sh
```

**Option 2: Manual Terraform Deployment**
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

## Management

**Update Deployment:**
```bash
cd infrastructure
terraform apply
```

**Package and Deploy Lambda:**
```bash
cd backend
./package-lambda.sh
cd ../infrastructure
terraform apply -target=module.lambda_function
```

**Test API:**
```bash
./scripts/test-api.sh
```

**Destroy Resources:**
```bash
cd infrastructure
terraform destroy
```

## Important Notes

- **Project-Specific**: This calculator is tailored for specific client requirements and infrastructure
- **Customization Required**: Significant configuration changes needed for different environments
- **Cost Accuracy**: Cost mappings reflect specific provider agreements and may not match your pricing
- **Calculation Logic**: Resource calculations are based on specific workload patterns and may need adjustment

## Support

For environment-specific adaptations:
- Review calculation logic in `backend/utils/calculator.py`
- Modify frontend behavior through JavaScript files in `frontend/assets/js/`
- Update infrastructure through Terraform modules in `infrastructure/modules/`

For detailed architecture and calculation methodology, see `docs/architecture.md`.