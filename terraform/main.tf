terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
}

# ECR Repository
resource "aws_ecr_repository" "main" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Push Docker image to ECR
locals {
  repo_url = aws_ecr_repository.main.repository_url
}

data "archive_file" "source" {
  type        = "zip"
  source_dir  = ".."
  output_path = "/tmp/source.zip"
  excludes = [
    ".terraform",
    ".git",
    "terraform/.terraform.lock.hcl",
    "node_modules",
    ".next"
  ]
}

resource "null_resource" "docker_push" {
  depends_on = [aws_ecr_repository.main]

  triggers = {
    source_code_hash = data.archive_file.source.output_sha
  }

  provisioner "local-exec" {
    command = <<EOT
      aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${local.repo_url}
      cd ..
      docker build -t ${local.repo_url}:latest .
      docker push ${local.repo_url}:latest
      cd terraform
    EOT
  }
}

# Lambda from ECR image + Function URL

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_execution" {
  name               = "${var.project_name}-lambda-exec"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda Function using ECR image
resource "aws_lambda_function" "web" {
  function_name = var.project_name
  role          = aws_iam_role.lambda_execution.arn
  package_type  = "Image"
  image_uri     = "${local.repo_url}:${var.image_tag}"
  architectures = ["x86_64"]
  timeout       = 30
  memory_size   = 1024

  environment {
    variables = {
      NODE_ENV            = "production"
      PORT                = "3000"
      AWS_LWA_INVOKE_MODE = "buffered"
    }
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_basic, null_resource.docker_push]
}

resource "aws_lambda_function_url" "web" {
  function_name      = aws_lambda_function.web.function_name
  authorization_type = "NONE"
  invoke_mode        = "BUFFERED"
  cors {
    allow_credentials = false
    allow_methods     = ["*"]
    allow_origins     = ["*"]
    allow_headers     = ["*"]
  }
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = trimsuffix(trimprefix(aws_lambda_function_url.web.function_url, "https://"), "/")
    origin_id   = "LambdaFunctionURL"
    origin_path = ""
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution for Adorsys GIS Blog Lambda Function URL"
  default_root_object = ""

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "LambdaFunctionURL"
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Origin", "User-Agent", "Referer"]
      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-cloudfront-distribution"
  }
}
