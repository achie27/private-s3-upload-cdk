# Overview
AWS CDK is used to create the AWS infrastructure required for third parties to upload images (JPEGs) to a private S3 bucket. This stack also sends an email every time an image is uploaded to the bucket.

# Prerequisites
1. Node and npm

# Setup
1. `npm ci`
2. Change `uploadNotificationEmail` in bin/private-s3-upload.ts to the email of your choice 
3. `npm run build`
4. `cdk deploy`
    - If a new AWS environment is being used, run `cdk bootstrap` before this step
5. Look out for `PrivateS3UploadStack.TheAPI` and `PrivateS3UploadStack.TheBucket` under "Outputs" - `PrivateS3UploadStack.TheAPI` is what clients will use and images will be uploaded to `PrivateS3UploadStack.TheBucket`

# Usage
1. This stack exposes `${TheAPI}/getPresignedUrl` for clients to get access to upload their JPEGs. Following are the request and response structures
    - GET `/getPresignedUrl`
    - ```json
      {
        "url": "...",
        "fields": {
          "key": "...",
          "bucket": "...",
          "X-Amz-Algorithm": "...",
          "X-Amz-Credential": "...",
          "X-Amz-Date": "...",
          "X-Amz-Security-Token": "...",
          "Policy": "...",
          "X-Amz-Signature": "..."
        }
      }
      ```
2. Clients then use the response from GET `/getPresignedUrl` to upload their JPEGs like so
    - ```cURL
      curl --location --request POST '${RESPONSE.url}' \
      --form 'key="${RESPONSE.fields.key}"' \
      --form 'bucket="${RESPONSE.fields.bucket}"' \
      --form 'X-Amz-Algorithm="${RESPONSE.fields['X-Amz-Algorithm']}"' \
      --form 'X-Amz-Credential="${RESPONSE.fields['X-Amz-Credential']}"' \
      --form 'X-Amz-Date="${RESPONSE.fields['X-Amz-Date']}"' \
      --form 'X-Amz-Security-Token="${RESPONSE.fields['X-Amz-Security-Token']}"' \
      --form 'Policy="${RESPONSE.fields['Policy']}"' \
      --form 'X-Amz-Signature="${RESPONSE.fields['X-Amz-Signature']}"' \
      --form 'Content-Type="image/jpeg"' \
      --form 'file=@"/path/to/image.jpg"'
      ```

# TODOs
- Add authentication on the API