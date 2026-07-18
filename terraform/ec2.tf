# ─────────────────────────────────────────────
# EC2 - Backend host (runs the Spring Boot app in Docker)
# ─────────────────────────────────────────────

# Always resolves to the latest Ubuntu 24.04 LTS AMI in this region, instead of
# hardcoding an AMI id that goes stale and eventually stops existing.
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd*/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# AWS's own published list of CloudFront's origin-facing IP ranges - lets the
# security group allow CloudFront in without hardcoding/maintaining an IP list
# ourselves. Used below so port 8080 is only reachable via CloudFront, not
# directly from the open internet.
data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

resource "aws_security_group" "backend" {
  name        = "${local.name}-backend-sg"
  description = "Backend EC2: SSH for deploys, app port only from CloudFront"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # fine for a training account; narrow to your own IP if you want it tighter
  }

  ingress {
    description     = "App port - CloudFront only, not the open internet"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  }

  egress {
    description = "All outbound - needed to reach MongoDB Atlas, Docker Hub, apt, etc."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name}-backend-sg"
  }
}

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.backend.id]

  # Installs Docker on first boot so the instance is ready to receive a
  # deployed container. Nothing app-specific runs here - the actual app gets
  # deployed afterward via deploy.sh (or GitHub Actions later).
  user_data = <<-EOF
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get install -y docker.io
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu
  EOF

  tags = {
    Name = "${local.name}-backend"
  }
}

# Stable IP that survives stop/start - both SSH access and the CloudFront
# origin below depend on this not changing out from under them.
resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"

  tags = {
    Name = "${local.name}-backend-eip"
  }
}
