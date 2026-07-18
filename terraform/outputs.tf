output "frontend_url" {
  description = "Open this in your browser"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "api_url" {
  description = "Backend URL - set as VITE_API_URL when building the frontend"
  value       = "https://${aws_cloudfront_distribution.backend.domain_name}"
}

output "s3_bucket" {
  description = "Used by deploy.sh to upload the built frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_distribution_id" {
  description = "Used by deploy.sh to invalidate the CloudFront cache after a frontend deploy"
  value       = aws_cloudfront_distribution.frontend.id
}

output "backend_distribution_id" {
  description = "CloudFront distribution ID in front of the backend"
  value       = aws_cloudfront_distribution.backend.id
}

output "backend_public_ip" {
  description = "SSH here to deploy the backend, e.g. ssh -i your-key.pem ubuntu@<this>"
  value       = aws_eip.backend.public_ip
}
