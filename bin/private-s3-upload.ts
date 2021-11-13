#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { PrivateS3UploadStack } from '../lib/private-s3-upload-stack';

const app = new cdk.App();
new PrivateS3UploadStack(app, 'PrivateS3UploadStack');
