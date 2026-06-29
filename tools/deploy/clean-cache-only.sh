#!/bin/bash

# Enable printing executed commands
set x
trap "exit" INT

# Get AWS PROFILE, S3 Bucket and CloudFront Id from environment variables  or write it down statically
#aws_profile=$AWS_PROFILE
    echo Invalidating cloudfront cache
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"


    echo "CloudFlare cache will be cleared"

    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ID/purge_cache" \
         -H "X-Auth-Email: user@example.com" \
         -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
         -H "Content-Type: application/json" \
         --data '{"purge_everything":true}'
