# K8S Capacity Calculator

A serverless application for calculating Kubernetes cluster capacity and costs.

## Features
- Calculate Kubernetes cluster resource requirements
- Estimate costs based on provisioner tiers
- Support for multiple environments (dev, staging, prod)
- Web-based interface with real-time calculations

## Quick Start

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform installed

### Deployment
```bash
# Clone and deploy
git clone <repository-url>
cd k8s-capacity-calculator
./scripts/deploy.sh