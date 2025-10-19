terraform {
  backend "s3" {
    bucket = "cap-tf-state-bucket"
    key    = "k8s-capacity-calculator/terraform.tfstate"
    region = "ap-southeast-1"
  }
}
