import { FilesConfiguration, FilesModule } from '@nestjs-mod/files';
import { SsoModule } from '@nestjs-mod-sso/sso';
import { MinioFilesService, MinioModule } from '@nestjs-mod/minio';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MinioFilesIntegrationConfiguration implements FilesConfiguration {
  constructor(private readonly minioFilesService: MinioFilesService) {}

  getFromDownloadUrlWithoutBucketNames(downloadUrl: string) {
    return this.minioFilesService.getFromDownloadUrlWithoutBucketNames(
      downloadUrl
    );
  }

  async deleteFile({
    downloadUrl,
  }: {
    bucketName: string;
    objectName: string;
    downloadUrl: string;
  }) {
    return await lastValueFrom(this.minioFilesService.deleteFile(downloadUrl));
  }

  async getPresignedUrls({
    bucketName,
    ext,
    userId,
  }: {
    bucketName: string;
    fullObjectName: string;
    ext: string;
    userId: string;
  }) {
    return await lastValueFrom(
      this.minioFilesService.getPresignedUrls({
        bucketName,
        expiry: 60,
        ext: ext,
        userId: userId,
      })
    );
  }
}

export function filesModuleForRootAsyncOptions(): Parameters<
  typeof FilesModule.forRootAsync
>[0] {
  return {
    imports: [SsoModule.forFeature(), MinioModule.forFeature()],
    configurationClass: MinioFilesIntegrationConfiguration,
  };
}
