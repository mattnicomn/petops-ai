# Terraform State Backend
# 
# Bootstrap prerequisite: The S3 bucket must exist before terraform init.
# Create once manually or via a bootstrap script:
#   aws s3api create-bucket --bucket petops-ai-terraform-state-253881689673 --region us-east-1
#   aws s3api put-bucket-versioning --bucket petops-ai-terraform-state-253881689673 --versioning-configuration Status=Enabled
#   aws s3api put-bucket-encryption --bucket petops-ai-terraform-state-253881689673 \
#     --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'
#   aws s3api put-public-access-block --bucket petops-ai-terraform-state-253881689673 \
#     --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
#
# Terraform 1.10+ supports native S3 state locking (no DynamoDB table required).
# The use_lockfile option enables lock-based concurrency control via S3.

terraform {
  backend "s3" {
    bucket       = "petops-ai-terraform-state-253881689673"
    key          = "petops-ai/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
