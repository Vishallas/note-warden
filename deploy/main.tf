provider "aws" {}

resource "aws_s3_bucket" "user-files" {
  bucket = "note-warden-server-user-files"
}

# resource "aws_dynamodb_table" "user-details" {
#   name = "note-warden-server-user-details"
# }

output "bucket-name" {
  value = aws_s3_bucket.user-files.bucket
}
