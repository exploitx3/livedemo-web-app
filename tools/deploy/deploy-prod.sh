#!/bin/bash

# Enable printing executed commands
set x
trap "exit" INT

# Get AWS PROFILE, S3 Bucket and CloudFront Id from environment variables  or write it down statically
#aws_profile=$AWS_PROFILE
s3_bucket="$S3_BUCKET"
cf_id="$CLOUDFRONT_ID" # app.livedemo.ai
build_folder="$BUILD_FOLDER"
clear_cloudflare=1
cloudflare_id="$CLOUDFLARE_ID"
cloudflare_token="$CLOUDFLARE_TOKEN"


#echo Profile: $aws_profile
echo S3_Bucket: $s3_bucket
echo CloudFront Distribution: $cf_id

#if [ -z "$aws_profile" ]; then
#  echo AWS_PROFILE not found
#  exit
#fi

if [ -z "$s3_bucket" ]; then
  echo S3_BUCKET not found
  exit
fi

#set env variable for aws cli
#export AWS_PROFILE=$aws_profile

if [ ! -d "$build_folder" ]; then
    echo "${red}Build folder not found${reset}"
    exit 0;
fi

echo Synching Build Folder: $s3_bucket...
aws s3 sync $build_folder/ s3://$s3_bucket --delete --acl public-read

if [ ! -z "$cf_id" ]; then
    echo Invalidating cloudfront cache
    aws cloudfront create-invalidation --distribution-id $cf_id --paths "/*"
fi


if [ ! -z "$clear_cloudflare" ]; then
    echo "CloudFlare cache will be cleared"

    curl -X POST "https://api.cloudflare.com/client/v4/zones/$cloudflare_id/purge_cache" \
         -H "X-Auth-Email: user@example.com" \
         -H "Authorization: Bearer $cloudflare_token" \
         -H "Content-Type: application/json" \
         --data '{"purge_everything":true}'
fi
