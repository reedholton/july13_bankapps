terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      workshop   = "full-stack"
      autodelete = "true"
      date       = var.created_date
      project    = "simple-bank"
    }
  }
}

locals {
  # Pattern: student-<name>-<project>
  name = "student-${var.student_name}-${var.project_name}"
}
