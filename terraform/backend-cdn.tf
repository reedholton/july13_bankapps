# ─────────────────────────────────────────────
# CloudFront - Backend HTTPS
# The EC2 instance only speaks plain HTTP on port 8080. The frontend is served
# over HTTPS via CloudFront above, and browsers block a HTTPS page from
# calling a plain HTTP API (mixed content) - full stop, not a CORS issue,
# not fixable from the app side. This distribution sits in front of the
# EC2 instance purely to terminate TLS with CloudFront's own free
# *.cloudfront.net certificate - no custom domain or Certbot needed.
# ─────────────────────────────────────────────

# Forwards every header (including Authorization, which CloudFront strips by
# default) straight through to the origin, untouched.
data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

# Disables caching entirely - this is a dynamic API, every request needs to
# actually reach the backend, not get served from CloudFront's edge cache.
data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

resource "aws_cloudfront_distribution" "backend" {
  enabled = true
  comment = "${local.name}-backend"

  origin {
    domain_name = aws_eip.backend.public_dns
    origin_id   = "ec2-backend"

    custom_origin_config {
      http_port              = 8080
      https_port              = 443
      origin_protocol_policy  = "http-only" # CloudFront <-> EC2 stays plain HTTP; viewer <-> CloudFront is HTTPS
      origin_ssl_protocols    = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "ec2-backend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods         = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods          = ["GET", "HEAD"]

    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
