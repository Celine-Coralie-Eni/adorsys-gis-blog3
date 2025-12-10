output "lambda_function_url" {
  description = "Public Function URL for the Lambda-hosted Next.js app"
  value       = aws_lambda_function_url.web.function_url
}

output "cloudfront_url" {
  description = "The URL of the CloudFront distribution"
  value       = "https://${aws_cloudfront_distribution.s3_distribution.domain_name}"
}

output "ecr_repository_url" {
  description = "ECR repository URL used for the Docker image"
  value       = aws_ecr_repository.main.repository_url
}
