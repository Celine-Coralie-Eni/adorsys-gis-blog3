variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "adorsys-gis-blog"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "image_tag" {
  description = "Docker image tag to deploy (typically git SHA from CI/CD)"
  type        = string
  default     = "latest"
}