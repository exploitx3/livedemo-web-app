#!/bin/bash

source ./prod.env

export ENV=prod && export NODE_ENV=production && npm run config-env && npm run bundle


s3_bucket_path="$S3_BUCKET_PATH"
bundle_path="$BUNDLE_PATH"

echo "$bundle_path uploading to s3_bucket_path"

aws s3 cp $bundle_path s3://$s3_bucket_path --acl public-read
