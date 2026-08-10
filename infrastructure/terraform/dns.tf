# Route 53 DNS for petops-ai.usmissionhero.com

data "aws_route53_zone" "usmissionhero" {
  name = "usmissionhero.com."
}

# ACM DNS validation records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.usmissionhero.zone_id
}

# A record pointing to CloudFront
resource "aws_route53_record" "frontend" {
  zone_id = data.aws_route53_zone.usmissionhero.zone_id
  name    = "petops-ai.usmissionhero.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}
