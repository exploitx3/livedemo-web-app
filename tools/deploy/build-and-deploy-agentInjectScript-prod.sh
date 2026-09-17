#!/bin/bash

source ./prod.env

export ENV=prod && export NODE_ENV=production && npm run config-env && npm run bundle-agent

# prod.env points S3_BUCKET_PATH at .../static/injectScript.bundle.js — swap
# the filename, keep the bucket/prefix, so both bundles live side by side.
s3_bucket_path="${S3_BUCKET_PATH%/*}/agentInjectScript.bundle.js"
bundle_path="src/agentInjectScript/agentInjectScript.bundle.js"

echo "$bundle_path uploading to $s3_bucket_path"

aws s3 cp $bundle_path s3://$s3_bucket_path --acl public-read
