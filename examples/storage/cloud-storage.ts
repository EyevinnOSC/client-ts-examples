import { Context, getInstance, waitForInstanceReady } from '@osaas/client-core';
import {
  MinioMinio,
  MinioMinioConfig,
  createMinioMinioInstance
} from '@osaas/client-services';
import { randomBytes } from 'crypto';
import * as Minio from 'minio';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function createPublicBucketPolicy(name: string) {
  return {
    Statement: [
      {
        Action: ['s3:GetBucketLocation', 's3:ListBucket'],
        Effect: 'Allow',
        Principal: {
          AWS: ['*']
        },
        Resource: [`arn:aws:s3:::${name}`]
      },
      {
        Action: ['s3:GetObject'],
        Effect: 'Allow',
        Principal: {
          AWS: ['*']
        },
        Resource: [`arn:aws:s3:::${name}/*`]
      }
    ],
    Version: '2012-10-17'
  };
}

async function createStorageBucketInEyevinnOSC(name: string, ctx: Context) {
  const sat = await ctx.getServiceAccessToken('minio-minio');
  let instance: MinioMinio = await getInstance(ctx, 'minio-minio', name, sat);
  if (!instance) {
    const rootPassword = randomBytes(16).toString('hex');
    const config: MinioMinioConfig = {
      name,
      RootUser: 'root',
      RootPassword: rootPassword
    };
    const newInstance = await createMinioMinioInstance(ctx, config);
    instance = newInstance;
    await waitForInstanceReady('minio-minio', name, ctx);
    await delay(2000);

    const minioClient = new Minio.Client({
      endPoint: new URL(instance.url).hostname,
      accessKey: 'root',
      secretKey: instance.RootPassword || ''
    });
    await minioClient.makeBucket(name);
    await minioClient.setBucketPolicy(
      name,
      JSON.stringify(createPublicBucketPolicy(name))
    );
  }

  return {
    name: instance.name,
    endpoint: instance.url,
    accessKeyId: 'root',
    secretAccessKey: instance.RootPassword || ''
  };
}

async function main() {
  const ctx = new Context();

  const storage = await createStorageBucketInEyevinnOSC('mybucket', ctx);
  const client = new S3Client({
    endpoint: storage.endpoint,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey
    }
  });
  const command = new ListBucketsCommand({});
  const data = await client.send(command);
  console.log(data.Buckets?.map((b: any) => b.Name));
}

main();
