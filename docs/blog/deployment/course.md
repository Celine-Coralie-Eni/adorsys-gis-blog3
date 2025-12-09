---
title: Deploying Next.js Applications to AWS
lang: en
slug: deploy-nextjs-aws
authors: Celine-Coralie
tags: [AWS, Terraform, Lambda, Deployment]
description: Deploying Next.js applications to AWS can be challenging, especially when balancing security, cost-efficiency, and automation. This article presents a production-ready deployment strategy using AWS Lambda, CloudFront, ECR, and Terraform.
domain: DevOps
date: 2025-12-09
---

![Deployment](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRArMN2H_A7iV3quYIUVokHHiRpugy-M2cfHA&s)

<!-- # Deploying Next.js Applications to AWS -->
<!-- ## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Containerization Strategy](#containerization-strategy)
6. [Infrastructure as Code with Terraform](#infrastructure-as-code-with-terraform)
7. [Security Best Practices](#security-best-practices)
8. [Resource Optimization](#resource-optimization)
9. [CI/CD Automation](#cicd-automation)
10. [Cost Analysis](#cost-analysis)
11. [Monitoring and Maintenance](#monitoring-and-maintenance)
12. [Conclusion](#conclusion) -->

---

## Introduction

Deploying Next.js applications to AWS can be challenging, especially when balancing security, cost-efficiency, and automation. This article presents a production-ready deployment strategy using **AWS Lambda**, **CloudFront**, **ECR**, and **Terraform**, demonstrating how to deploy Next.js apps in a serverless, scalable, and cost-effective manner.

### Why This Approach?

Traditional deployment methods like EC2 instances or ECS clusters can be:
- **Expensive**: You pay for idle time and over-provisioned resources
- **Complex**: Requires managing servers, auto-scaling, and load balancers
- **Less secure**: More attack surface with always-on servers

Our serverless approach using Lambda offers:
- **Pay-per-request pricing** (no idle costs)
- **Automatic scaling** from zero to thousands of requests
- **Reduced attack surface** with ephemeral compute
- **Built-in high availability** across multiple availability zones
- **Infrastructure as Code** for reproducible deployments

---

## Architecture Overview

Our deployment architecture consists of the following AWS services:

```mermaid
graph TB
    User[User/Browser] -->|HTTPS| CF[CloudFront CDN]
    CF -->|Forward Request| LFU[Lambda Function URL]
    LFU -->|Invoke| Lambda[Lambda Function<br/>Next.js App]
    Lambda -->|Query| RDS[(External Database<br/>PostgreSQL)]
    Lambda -->|Authenticate| KC[Keycloak<br/>Identity Provider]
    Lambda -->|API Calls| DS[DocuSeal Service]
    
    GHA[GitHub Actions] -->|Build & Push| ECR[ECR Repository<br/>Docker Images]
    ECR -->|Pull Image| Lambda
    
    TF[Terraform] -->|Provision| CF
    TF -->|Provision| Lambda
    TF -->|Provision| ECR
    TF -->|Provision| LFU
    
    style CF fill:#FF9900
    style Lambda fill:#FF9900
    style ECR fill:#FF9900
    style LFU fill:#FF9900
    style GHA fill:#2088FF
    style TF fill:#7B42BC
```

### Component Breakdown

| Component | Purpose | Why We Use It |
|-----------|---------|---------------|
| **AWS Lambda** | Serverless compute for Next.js app | Pay-per-request, auto-scaling, no server management |
| **CloudFront** | Global CDN and edge caching | Low latency, DDoS protection, HTTPS termination |
| **ECR** | Container registry | Store and version Docker images securely |
| **Lambda Function URL** | HTTP(S) endpoint for Lambda | Simple, built-in endpoint without API Gateway costs |
| **Terraform** | Infrastructure as Code | Version-controlled, reproducible infrastructure |
| **GitHub Actions** | CI/CD automation | Automated builds and deployments on code changes |

---

## Prerequisites

Before starting, ensure you have:

### Required Tools
- **Node.js** 20+ (LTS recommended)
- **Docker** and Docker Compose
- **Terraform** 1.0+
- **AWS CLI** configured with credentials
- **Git** for version control

### AWS Account Setup
1. Create an AWS account (if you don't have one)
2. Create an IAM user with programmatic access
3. Attach the following policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AWSLambda_FullAccess`
   - `CloudFrontFullAccess`
   - `IAMFullAccess` (for creating Lambda execution roles)
4. Generate and securely store AWS access keys

### External Services
- **Database**: PostgreSQL instance (AWS RDS, Neon, Supabase, etc.)
- **Authentication** (optional): Keycloak, Auth0, or similar
- **Third-party APIs**: Any external services your app depends on

---

## Local Development Setup

A robust local development environment is crucial for testing before deployment. We use **Docker Compose** to replicate the production environment locally.

### Docker Compose Configuration

Our local setup includes:
- **Next.js app** with hot reload
- **PostgreSQL** for the application database
- **Keycloak** for authentication (with its own database)
- **DocuSeal** for document management (with its own database)
- **MailHog** for email testing

#### Key Benefits of This Approach

1. **Environment Parity**: Local environment mirrors production
2. **Isolated Dependencies**: Each service runs in its own container
3. **Easy Onboarding**: New developers can start with `docker compose up`
4. **Database Migrations**: Automatically applied on container startup

### Environment Variables Strategy

We use **two database URLs** to handle different contexts:

```env
# For application runtime (inside Docker container)
DATABASE_URL="postgresql://postgres:postgres@postgres-nextjs:5432/nextjs_db"

# For Prisma CLI (from host machine)
DIRECT_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/nextjs_db"
```

> [!IMPORTANT]
> The `DATABASE_URL` uses the Docker service name (`postgres-nextjs`) and internal port (`5432`), while `DIRECT_DATABASE_URL` uses `localhost` and the mapped port (`5433`). This allows both containerized apps and host-based tools to access the database.

### Development Workflow

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f nextjs-app

# Run database migrations
docker compose exec nextjs-app npx prisma migrate dev

# Stop all services
docker compose down

# Reset databases (remove volumes)
docker compose down -v
```

---

## Containerization Strategy

Efficient Docker images are critical for fast deployments and reduced costs. We use a **multi-stage build** to optimize image size and security.

### Multi-Stage Dockerfile

Our Dockerfile has three stages:

#### Stage 1: Dependencies
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
```
- Uses Alpine Linux (smallest base image)
- Installs only production dependencies
- Leverages Docker layer caching

#### Stage 2: Builder
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV CI=false
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
# ... other dummy env vars for build time
RUN npx prisma generate
RUN npm run build
```
- Installs all dependencies (including dev dependencies)
- Uses dummy environment variables (build doesn't need real credentials)
- Generates Prisma client
- Builds Next.js app with `output: 'standalone'`

> [!TIP]
> The `output: 'standalone'` configuration in `next.config.js` creates a minimal production build that includes only necessary dependencies, reducing image size by up to 80%.

#### Stage 3: Runtime
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app

# Add AWS Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter

ENV NODE_ENV=production
ENV PORT=3000

# Use non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone .
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

USER nextjs
CMD ["node", "server.js"]
```

### Key Security Features

1. **Non-root user**: Runs as `nextjs` user (UID 1001)
2. **Minimal attack surface**: Only production code included
3. **AWS Lambda Web Adapter**: Enables standard Node.js apps to run on Lambda

### AWS Lambda Web Adapter

The [AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter) is a Lambda extension that allows you to run web applications (like Next.js) on Lambda without code changes.

**How it works:**
1. Lambda invokes the adapter
2. Adapter starts your Next.js server on port 3000
3. Adapter forwards HTTP requests to your server
4. Your app responds as if running on a traditional server

**Benefits:**
- No code changes needed
- Works with any web framework
- Supports streaming responses
- Handles request/response buffering

---

## Infrastructure as Code with Terraform

Terraform allows us to define our entire AWS infrastructure as code, making it version-controlled, reproducible, and auditable.

### Project Structure

```
terraform/
├── main.tf           # Main infrastructure definitions
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── terraform.tfvars  # Variable values (gitignored)
└── backend.tf        # Remote state configuration (generated in CI/CD)
```

### Core Infrastructure Components

#### 1. ECR Repository

```hcl
resource "aws_ecr_repository" "main" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}
```

> [!NOTE]
> `scan_on_push = true` automatically scans images for vulnerabilities using AWS's built-in scanner, helping identify security issues early.

#### 2. Docker Build and Push

```hcl
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
```

This resource:
- Triggers rebuild when source code changes
- Authenticates with ECR
- Builds and pushes Docker image
- Runs locally during `terraform apply`

#### 3. Lambda Execution Role

```hcl
resource "aws_iam_role" "lambda_execution" {
  name               = "${var.project_name}-lambda-exec"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
```

The `AWSLambdaBasicExecutionRole` provides:
- CloudWatch Logs permissions
- Basic Lambda execution permissions

#### 4. Lambda Function

```hcl
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
      DATABASE_URL        = var.database_url
      NEXTAUTH_URL        = var.nextauth_url
      NEXTAUTH_SECRET     = var.nextauth_secret
      # ... other environment variables
      PORT                = "3000"
      AWS_LWA_INVOKE_MODE = "buffered"
    }
  }
}
```

**Configuration choices:**
- **timeout = 30**: Maximum execution time (adjust based on your needs)
- **memory_size = 1024**: 1GB RAM (CPU scales with memory)
- **AWS_LWA_INVOKE_MODE = "buffered"**: Response buffering for better performance

> [!TIP]
> Lambda CPU power scales linearly with memory. At 1024 MB, you get approximately 0.6 vCPU. For CPU-intensive apps, increase memory to 1769 MB for 1 full vCPU.

#### 5. Lambda Function URL

```hcl
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
```

**Why Function URLs instead of API Gateway?**
- **Cost**: Free (vs. $3.50 per million requests for API Gateway)
- **Simplicity**: No complex API Gateway configuration
- **Performance**: Direct invocation with lower latency

> [!WARNING]
> Function URLs are publicly accessible by default. For production apps requiring authentication, implement application-level auth (like NextAuth.js) or use API Gateway with IAM authorization.

#### 6. CloudFront Distribution

```hcl
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = trimsuffix(trimprefix(aws_lambda_function_url.web.function_url, "https://"), "/")
    origin_id   = "LambdaFunctionURL"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  
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
}
```

**CloudFront benefits:**
- **Global CDN**: 450+ edge locations worldwide
- **DDoS protection**: AWS Shield Standard included
- **SSL/TLS**: Free HTTPS with CloudFront certificate
- **Caching**: Reduces Lambda invocations and costs
- **Compression**: Automatic gzip/brotli compression

### Variable Management

Sensitive variables are marked as `sensitive = true`:

```hcl
variable "database_url" {
  description = "PostgreSQL database connection URL"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth.js secret for session encryption"
  type        = string
  sensitive   = true
}
```

This prevents values from appearing in Terraform logs and output.

### Terraform Outputs

```hcl
output "cloudfront_url" {
  description = "The URL of the CloudFront distribution"
  value       = "https://${aws_cloudfront_distribution.s3_distribution.domain_name}"
}

output "lambda_function_url" {
  description = "Public Function URL for the Lambda-hosted Next.js app"
  value       = aws_lambda_function_url.web.function_url
}

output "ecr_repository_url" {
  description = "ECR repository URL used for the Docker image"
  value       = aws_ecr_repository.main.repository_url
}
```

These outputs are used in CI/CD to update environment variables dynamically.

---

## Security Best Practices

Security should be built into every layer of your deployment.

### 1. Container Security

✅ **Non-root user**: All processes run as `nextjs` user (UID 1001)
```dockerfile
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs
```

✅ **Minimal base image**: Alpine Linux reduces attack surface
```dockerfile
FROM node:20-alpine
```

✅ **Image scanning**: ECR automatically scans for vulnerabilities
```hcl
image_scanning_configuration {
  scan_on_push = true
}
```

✅ **No secrets in images**: All secrets passed via environment variables

### 2. Network Security

✅ **HTTPS everywhere**: CloudFront enforces HTTPS
```hcl
viewer_protocol_policy = "redirect-to-https"
```

✅ **TLS 1.2+**: Only modern, secure protocols
```hcl
origin_ssl_protocols = ["TLSv1.2"]
```

✅ **CORS configuration**: Controlled cross-origin access
```hcl
cors {
  allow_credentials = false
  allow_methods     = ["*"]
  allow_origins     = ["*"]
  allow_headers     = ["*"]
}
```

> [!CAUTION]
> For production, restrict `allow_origins` to your specific domains instead of using `["*"]`.

### 3. Secrets Management

✅ **GitHub Secrets**: Store sensitive values in GitHub
- Never commit secrets to git
- Use GitHub Actions secrets for CI/CD
- Rotate secrets regularly

✅ **Terraform sensitive variables**: Mark sensitive inputs
```hcl
variable "nextauth_secret" {
  type      = string
  sensitive = true
}
```

- Environment-specific secrets: Different secrets per environment
```yaml
environment:
  name: ${{ inputs.environment }}
```

### 4. IAM Least Privilege

- Minimal Lambda permissions: Only CloudWatch Logs access
```hcl
policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
```

- Separate roles per function: Each Lambda has its own execution role

### 5. Database Security

- Connection pooling: Use connection poolers (PgBouncer, Neon)
```env
DATABASE_URL="postgresql://user:pass@db-pooler.example.com:5432/db"
```

- SSL connections: Enforce SSL for database connections
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

- Separate credentials: Different database users for different environments

### 6. Application Security

- Authentication: Use NextAuth.js or similar
```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID,
      clientSecret: process.env.KEYCLOAK_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
})
```

- CSRF protection: Built into NextAuth.js

- Input validation: Use Zod or similar for request validation

---

## Resource Optimization

Optimizing resources reduces costs and improves performance.

### 1. Next.js Optimization

#### Standalone Output
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
}
```

This creates a minimal production build:
- **Before**: ~500MB (includes all node_modules)
- **After**: ~50-100MB (only required dependencies)

#### Build-time Optimizations
```javascript
module.exports = {
  eslint: {
    ignoreDuringBuilds: true, // Lint in CI, not during build
  },
  typescript: {
    ignoreBuildErrors: true, // Type-check in CI
  },
}
```

> [!TIP]
> Move linting and type-checking to CI/CD to speed up builds. This doesn't mean skipping them—just doing them in parallel with the build.

### 2. Docker Image Optimization

- **Multi-stage builds**: Only production code in final image
- **Layer caching**: Order Dockerfile commands by change frequency
- **Alpine base**: Smallest possible base image
- **.dockerignore**: Exclude unnecessary files

```dockerignore
.next
node_modules
.env.local
.git
terraform
```

**Image size comparison:**
- **Without optimization**: ~1.5GB
- **With multi-stage build**: ~200MB
- **With standalone output**: ~100MB

### 3. Lambda Configuration

#### Memory vs. Cost Trade-off

| Memory | vCPU | Cold Start | Cost per 1M requests | Best For |
|--------|------|------------|----------------------|----------|
| 512 MB | 0.3 | ~3s | $8.33 | Low-traffic, simple apps |
| 1024 MB | 0.6 | ~2s | $16.67 | **Recommended for most apps** |
| 1769 MB | 1.0 | ~1.5s | $29.05 | CPU-intensive apps |
| 3008 MB | 1.7 | ~1s | $50.00 | High-performance requirements |

> [!IMPORTANT]
> Higher memory = more CPU = faster execution = potentially lower total cost. Test different configurations to find the sweet spot for your app.

#### Timeout Configuration

```hcl
timeout = 30  # seconds
```

- **Too low**: Requests may timeout
- **Too high**: Costs increase for slow requests
- **Recommended**: 30s for web apps, 900s (max) for background jobs

### 4. CloudFront Caching

#### Cache Behavior Configuration

```hcl
default_cache_behavior {
  min_ttl     = 0      # Don't cache dynamic content
  default_ttl = 3600   # Cache static content for 1 hour
  max_ttl     = 86400  # Maximum cache time: 24 hours
  compress    = true   # Enable compression
}
```

#### Cache-Control Headers

In your Next.js app:

```typescript
// For static assets
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

// For dynamic content
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
```

### 5. Database Connection Management

Lambda functions are ephemeral, which can cause connection pool exhaustion.

**Solutions:**

1.  **Use a connection pooler** (recommended)
    ```env
    DATABASE_URL="postgresql://user:pass@pooler.example.com:5432/db"
    ```

2.  **Use Prisma's connection limit**
    ```typescript
    // prisma/schema.prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    
    // Set connection limit
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?connection_limit=1',
        },
      },
    })
    ```

3.  **Use serverless-friendly databases**
    - Neon (built-in connection pooling)
    - PlanetScale (HTTP-based)
    - Supabase (Supavisor pooler)

---

## CI/CD Automation

Automation ensures consistent, reliable deployments and reduces human error.

### GitHub Actions Workflow

Our deployment workflow:

```yaml
name: Terraform Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment name"
        required: true
        type: choice
        options:
          - production
          - dev
          - staging
```

**Why `workflow_dispatch`?**
- Manual trigger for production deployments
- Prevents accidental deployments
- Allows environment selection

### Workflow Steps

#### 1. Setup

```yaml
- name: Checkout Code
  uses: actions/checkout@v4

- name: Set up Terraform
  uses: hashicorp/setup-terraform@v3
  with:
    terraform_version: "1.9.8"

- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: eu-central-1
```

#### 2. Environment Variables

```yaml
- name: Set Sensitive Variables
  run: |
    echo "TF_VAR_database_url=${{ secrets.DATABASE_URL }}" >> $GITHUB_ENV
    echo "TF_VAR_nextauth_secret=${{ secrets.NEXTAUTH_SECRET }}" >> $GITHUB_ENV
    # ... other secrets
```

> [!NOTE]
> Secrets are stored in GitHub and injected as environment variables. They never appear in logs.

#### 3. Remote State Configuration

```yaml
- name: Create Backend Configuration
  run: |
    cat <<EOF > backend.tf
    terraform {
      backend "s3" {
        bucket  = "gis-docusign-${{ inputs.environment }}-terraform-state"
        key     = "terraform.tfstate"
        region  = "eu-central-1"
        encrypt = true
      }
    }
    EOF
```

**Benefits of remote state:**
- **Team collaboration**: Multiple developers can work together
- **State locking**: Prevents concurrent modifications
- **Versioning**: S3 versioning tracks state history
- **Encryption**: State is encrypted at rest

#### 4. Terraform Execution

```yaml
- name: Terraform Init
  run: terraform init

- name: Terraform Plan
  run: terraform plan -out=plan.tfplan

- name: Terraform Apply
  if: github.event_name == 'workflow_dispatch'
  run: terraform apply -auto-approve plan.tfplan
```

**Why save the plan?**
- Ensures `apply` executes exactly what was planned
- Prevents race conditions
- Provides audit trail

#### 5. Post-Deployment Configuration

```yaml
- name: Update NEXTAUTH_URL Variable and Lambda Environment
  run: |
    CF_URL=$(terraform output -raw cloudfront_url)
    echo "Updating NEXTAUTH_URL to $CF_URL"
    gh variable set NEXTAUTH_URL --body "$CF_URL" --env ${{ inputs.environment }}
    
    # Update Lambda environment variable
    aws lambda update-function-configuration \
      --function-name "gis-docusign-${{ inputs.environment }}" \
      --environment "Variables={...,NEXTAUTH_URL=$CF_URL,...}"
```

This step:
1. Extracts CloudFront URL from Terraform output
2. Updates GitHub environment variable
3. Updates Lambda function environment

> [!IMPORTANT]
> The `NEXTAUTH_URL` must match the CloudFront URL for authentication to work. This step ensures they're always in sync.

### Environment Protection Rules

Configure GitHub environments with protection rules:

1.  **Required reviewers**: Require approval before production deployment
2.  **Wait timer**: Delay deployments by X minutes
3.  **Deployment branches**: Only allow deployments from `main` branch

### Destroy Workflow

We also have a destroy workflow for tearing down environments:

```yaml
name: Terraform Destroy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment name"
        required: true
        type: choice
        options:
          - dev
          - staging
          # Note: production is excluded for safety
```

> [!CAUTION]
> Never include production in the destroy workflow. Require manual Terraform commands for production teardown.

---

## Cost Analysis

Understanding costs helps optimize your deployment.

### Monthly Cost Breakdown (Example)

Assumptions:
- 100,000 requests/month
- Average response time: 500ms
- 1024 MB Lambda memory
- 50% cache hit rate on CloudFront

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda Requests** | 100,000 requests | $0.02 |
| **Lambda Compute** | 50,000 GB-seconds | $0.83 |
| **CloudFront Requests** | 100,000 requests | $0.01 |
| **CloudFront Data Transfer** | 10 GB | $0.85 |
| **ECR Storage** | 1 GB | $0.10 |
| **Data Transfer (Lambda → DB)** | 5 GB | $0.45 |
| **Total** | | **~$2.26/month** |

### Cost Optimization Tips

1.  **Increase cache hit rate**: More caching = fewer Lambda invocations
    ```hcl
    default_ttl = 3600  # Cache for 1 hour
    ```

2.  **Optimize Lambda memory**: Test different configurations
    ```bash
    # Use AWS Lambda Power Tuning
    # https://github.com/alexcasalboni/aws-lambda-power-tuning
    ```

3.  **Use CloudFront compression**: Reduces data transfer costs
    ```hcl
    compress = true
    ```

4.  **Implement request coalescing**: Batch API calls where possible

5.  **Use reserved capacity** (for high-traffic apps): Save up to 70%

### Cost Comparison

| Deployment Method | Monthly Cost (100K requests) | Pros | Cons |
|-------------------|------------------------------|------|------|
| **Lambda + CloudFront** | ~$2-5 | Pay-per-use, auto-scaling | Cold starts |
| **EC2 t3.small** | ~$15 | Consistent performance | Always-on costs |
| **ECS Fargate** | ~$30 | Container orchestration | Higher costs |
| **Vercel Hobby** | $0 (free tier) | Easy deployment | Limited to 100GB bandwidth |
| **Vercel Pro** | $20 | Unlimited bandwidth | Fixed cost |

---

## Monitoring and Maintenance

Monitoring ensures your app stays healthy and performant.

### 1. CloudWatch Logs

Lambda automatically logs to CloudWatch:

```bash
# View logs
aws logs tail /aws/lambda/gis-docusign-production --follow

# Filter errors
aws logs filter-pattern /aws/lambda/gis-docusign-production --filter-pattern "ERROR"
```

### 2. CloudWatch Metrics

Key metrics to monitor:

| Metric | What It Means | Alert Threshold |
|--------|---------------|-----------------|
| **Invocations** | Number of requests | N/A (informational) |
| **Errors** | Failed requests | > 1% error rate |
| **Duration** | Execution time | > 25s (approaching timeout) |
| **Throttles** | Rate-limited requests | > 0 |
| **ConcurrentExecutions** | Simultaneous invocations | > 800 (approaching limit) |

### 3. CloudWatch Alarms

Create alarms for critical metrics:

```hcl
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "This metric monitors lambda errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = aws_lambda_function.web.function_name
  }
}
```

### 4. Application Performance Monitoring (APM)

Consider using APM tools:
- **Sentry**: Error tracking and performance monitoring
- **Datadog**: Full-stack observability
- **New Relic**: Application performance monitoring
- **AWS X-Ray**: Distributed tracing

### 5. Database Monitoring

Monitor database performance:
- **Connection count**: Ensure you're not exhausting connections
- **Query performance**: Identify slow queries
- **Replication lag**: For read replicas

### 6. Regular Maintenance Tasks

- Update dependencies: Monthly security updates
```bash
npm audit fix
npm update
```

- Rotate secrets: Quarterly rotation
- Database passwords
- API keys
- NextAuth secret

- Review CloudWatch costs: Monitor log retention
```hcl
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project_name}"
  retention_in_days = 7  # Adjust based on needs
}
```

- Clean up old ECR images: Remove unused images
```bash
# Delete images older than 30 days
aws ecr list-images --repository-name gis-docusign-production \
  --filter "tagStatus=UNTAGGED" \
  --query 'imageIds[*]' \
  --output json | jq -r '.[] | .imageDigest' | \
  xargs -I {} aws ecr batch-delete-image \
    --repository-name gis-docusign-production \
    --image-ids imageDigest={}
```

---

## Conclusion

Deploying Next.js applications to AWS using Lambda, CloudFront, and Terraform provides a robust, scalable, and cost-effective solution. This approach offers:

### Key Takeaways

- Serverless architecture: Pay only for what you use, with automatic scaling

- Infrastructure as Code: Reproducible, version-controlled infrastructure

- Security by design: Multiple layers of security built-in

- Cost optimization: Significantly cheaper than traditional server deployments

- Developer experience: Local development mirrors production

- Automation: CI/CD pipelines reduce manual errors

### Best Practices Summary

4. **Configure CloudFront caching** to reduce Lambda invocations
5. **Use connection pooling** for database connections
6. **Monitor with CloudWatch** and set up alarms
7. **Automate deployments** with GitHub Actions
8. **Test locally** with Docker Compose before deploying

### When to Use This Approach

**Good fit for:**
- Low to medium traffic applications (< 1M requests/month)
- Applications with variable traffic patterns
- Cost-sensitive projects
- Teams wanting infrastructure as code
- Applications requiring global distribution

**❌ Not ideal for:**
- Applications requiring sub-100ms response times consistently
- Very high traffic (> 10M requests/month) - consider ECS/EKS
- Applications with long-running processes (> 15 minutes)
- WebSocket-heavy applications (use API Gateway WebSocket or ECS)

### Next Steps

1. **Set up your AWS account** and configure credentials
2. **Clone the reference implementation** and customize for your needs
3. **Test locally** with Docker Compose
4. **Deploy to a dev environment** first
5. **Monitor and optimize** based on real-world usage
6. **Gradually roll out** to staging and production

### Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)

---

## Example Project Reference

This article is based on a real-world implementation of a document management system using:
- **Next.js 14** with App Router
- **Prisma** for database ORM
- **NextAuth.js** with Keycloak for authentication
- **DocuSeal** for document signing
- **PostgreSQL** for data persistence

The complete source code demonstrates:
- Multi-service Docker Compose setup
- Terraform infrastructure provisioning
- GitHub Actions CI/CD pipelines
- Security best practices
- Resource optimization techniques

By following the patterns outlined in this article, you can deploy production-ready Next.js applications to AWS with confidence, knowing they're secure, cost-effective, and maintainable.

---

**Author's Note**: This deployment strategy has been battle-tested in production environments and continues to evolve with AWS and Next.js best practices. Always test thoroughly in non-production environments before deploying to production.
