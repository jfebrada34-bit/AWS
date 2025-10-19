variable "lambda_name" {
    type = string
  
}
variable "source_dir" {
    type = string
  
}
variable "handler" {
    type = string
    default = "app.lambda_handler"
  
}
variable "runtime" {
    type = string
    default = "python3.9"
  
}
variable "memory_size" {
    type = number
    default = 128
  
}
variable "timeout" {
    type = number
    default = 10
  
}
variable "environment_variables" {
    type = map(string)
    default = {}
  
}
variable "tags" {
    type = map(string)
    default = {}
    }
variable "allow_api_gateway" {
    type = bool
    default = true
  
}
variable "environment" {
    type = string
    default = "dev"
  
}
