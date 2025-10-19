frontend_bucket_name = "k8s-calculator-frontend"
lambda_name     = "k8s-capacity-backend"
lambda_handler  = "app.handler"
lambda_runtime  = "python3.9"

lambda_env = {
  TABLE_NAME = "CapacityData"
}

api_name = "k8s-capacity-api"

tags = {
  Project = "K8s Capacity Calculator"
  Owner   = "Jereil"
}
