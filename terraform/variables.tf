variable "student_name" {
  description = "Your name in lowercase with no spaces (e.g. reed-holton). Used to name resources."

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.student_name))
    error_message = "student_name must be lowercase letters, numbers, and hyphens only."
  }
}

variable "project_name" {
  description = "Project name - combined with student_name to form resource names"
  default     = "simple-bank"
}

variable "aws_region" {
  default = "us-east-1"
}

variable "created_date" {
  description = "Creation date for the `date` tag, format dd-mmm-yyyy (e.g. 12-Jul-2026)."
  type        = string
}

variable "key_pair_name" {
  description = "Name of an EXISTING EC2 key pair already in your AWS account (e.g. the one from the hello-cicd lab). Not created by this config."
  type        = string
}

variable "instance_type" {
  description = "t3.micro is the default - if the backend struggles to start (Spring Boot + JVM on 1GB RAM), bump to t3.small."
  default     = "t3.micro"
}
