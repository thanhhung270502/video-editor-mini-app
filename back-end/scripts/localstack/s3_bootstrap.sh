#!/bin/bash

echo "Creating S3 buckets..."

export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
set -euo pipefail

buckets=("kane-blog-local")

# Endpoint URL for LocalStack
endpoint_url="http://localhost:4566"

for bucket_name in "${buckets[@]}"; do
    awslocal --endpoint-url="$endpoint_url" s3api create-bucket --bucket "$bucket_name"
    awslocal --endpoint-url="$endpoint_url" s3api put-bucket-cors --bucket "$bucket_name" --cors-configuration file:///etc/localstack/init/ready.d/cors-config.json
done
