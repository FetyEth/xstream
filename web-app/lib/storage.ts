import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// AWS S3 client configuration
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'xstream-base';

export interface UploadResult {
  key: string;
  url: string;
  publicUrl: string;
}

export const storageService = {
  async uploadVideo(
    file: Buffer,
    filename: string,
    contentType: string = 'video/mp4'
  ): Promise<UploadResult> {
    const key = `videos/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`;

    return {
      key,
      url: publicUrl,
      publicUrl,
    };
  },

  async uploadThumbnail(
    file: Buffer,
    filename: string,
    contentType: string = 'image/jpeg'
  ): Promise<UploadResult> {
    const key = `thumbnails/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`;

    return {
      key,
      url: publicUrl,
      publicUrl,
    };
  },

  async uploadHLSFile(
    file: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`;
  },

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  },

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  },

  async getFileContent(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const content = await response.Body?.transformToString();
    
    if (!content) {
      throw new Error('Failed to read file content');
    }

    return content;
  },

  getPublicUrl(key: string): string {
    return `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`;
  },
};
