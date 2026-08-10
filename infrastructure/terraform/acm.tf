# ACM Certificate for custom domain (must be in us-east-1 for CloudFront)

resource "aws_acm_certificate" "frontend" {
  domain_name       = "petops-ai.usmissionhero.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "petops-ai-certificate"
  }
}

resource "aws_acm_certificate_validation" "frontend" {
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
