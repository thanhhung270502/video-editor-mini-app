import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

class S3Service {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    const region = process.env.AWS_REGION || "us-east-1";
    this.bucketName = process.env.AWS_S3_BUCKET || "video-editor-bucket";

    const config: any = {
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
      },
    };

    // Support LocalStack custom endpoint if provided
    if (process.env.AWS_S3_ENDPOINT) {
      config.endpoint = process.env.AWS_S3_ENDPOINT;
      config.forcePathStyle = true; // Required for LocalStack
    }

    this.client = new S3Client(config);
  }

  /**
   * Automatically verify if bucket exists, and create it if it doesn't.
   * Useful for seamless LocalStack and development experiences.
   */
  async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log(`S3 Bucket "${this.bucketName}" already exists.`);
    } catch (error: any) {
      // If bucket does not exist, create it
      if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
        console.log(`S3 Bucket "${this.bucketName}" not found. Creating bucket...`);
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          console.log(`S3 Bucket "${this.bucketName}" successfully created.`);
        } catch (createError: any) {
          console.error(`Failed to create bucket "${this.bucketName}":`, createError.message);
        }
      } else {
        console.warn(`Could not verify bucket "${this.bucketName}" status:`, error.message);
      }
    }
  }

  /**
   * Upload a local file to S3
   */
  async uploadFile(localFilePath: string, s3Key: string, contentType: string = "video/mp4"): Promise<string> {
    await this.ensureBucketExists();

    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file not found at path: ${localFilePath}`);
    }

    const fileStream = fs.createReadStream(localFilePath);
    
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileStream,
        ContentType: contentType,
      })
    );

    console.log(`Successfully uploaded ${localFilePath} to S3 Key: ${s3Key}`);
    return s3Key;
  }

  /**
   * Generate a Presigned Get URL for a file
   */
  async getPresignedUrl(s3Key: string, expiresInSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    // Generate signed URL
    const url = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    return url;
  }
}

export const s3Service = new S3Service();
export default s3Service;
