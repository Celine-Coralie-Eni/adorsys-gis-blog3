---

title: Terraform
slug: terraform
tags: \[devops, cloud, infrastructure]

---

![Terraform](https://cdn.prod.website-files.com/67f9776b8553224cbb897cd7/680fb932e0ea656c1a28e844_f607894a26f94bcc32aa94578acafd2c863efb31-1055x514.png)

---

Terraform is an open-source **Infrastructure as Code (IaC)** tool that lets you define, provision, and manage cloud resources with configuration files.

---

## Why Terraform?

1. **Multi-Cloud Support** (AWS, Azure, GCP, etc.)
2. **Infrastructure as Code** (declarative configs)
3. **State Management** (track resources)
4. **Automation & Collaboration**

---

## Core Concepts

* **Providers**: Plugins for cloud platforms (e.g., AWS).
* **Resources**: Cloud components like servers, buckets, DBs.
* **State File**: Tracks real-world infrastructure.
* **Modules**: Reusable Terraform configurations.

---

## Terraform Workflow

1. **Write** – Define `.tf` files with resources.
2. **Init** – `terraform init` to set up providers.
3. **Plan** – `terraform plan` to preview changes.
4. **Apply** – `terraform apply` to create/update resources.
5. **Destroy** – `terraform destroy` to tear down.

---

## Example: AWS EC2 Instance

```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```

---

## Terraform State

* Stored in `terraform.tfstate`.
* Records IDs & metadata of resources.
* Can be local or remote (S3, GCS, Terraform Cloud).

---

## Variables & Outputs

```hcl
variable "region" {
  default = "us-east-1"
}

output "instance_ip" {
  value = aws_instance.web.public_ip
}
```

---

## Modules

* Package multiple `.tf` files into reusable units.
* Share via Terraform Registry.
* Encourages clean, DRY configurations.

---

## Remote Backends

* Store state remotely for collaboration.
* Common: AWS S3 + DynamoDB (locking).
* Prevents state corruption in teams.

---

## Best Practices

* Use version control (Git).
* Separate environments (dev, staging, prod).
* Use remote state with locking.
* Validate configs with `terraform validate`.
* Keep variables and secrets secure.

---

## Terraform vs CloudFormation

* **Terraform**: Multi-cloud, HCL language, open-source.
* **CloudFormation**: AWS-only, JSON/YAML, managed by AWS.

---

## Conclusion

Terraform enables **scalable, repeatable, and automated infrastructure management** across multiple clouds, making it a must-have tool for modern DevOps.

---