import { Injectable } from '@angular/core';
import { BlobServiceClient, AnonymousCredential, newPipeline } from '@azure/storage-blob';

@Injectable({
  providedIn: 'root'
})
export class AzureBlobStorageService {
  private blobServiceClient: BlobServiceClient;

  constructor() {
    const connectionString = 'DefaultEndpointsProtocol=https;AccountName=byokulstorage;AccountKey=exYHA69x6yj0g9ET7+0ODXjs1zPYtqAqCkiwUuT7ocLG3qQOFhWKEn9Q+oS6EC6qcT+AJM+Cj8KR+ASt+3Lu5Q==;EndpointSuffix=core.windows.net';
    const anonymousCredential = new AnonymousCredential();
    const pipeline = newPipeline(anonymousCredential);
    this.blobServiceClient = new BlobServiceClient(connectionString, pipeline);
  }

  async uploadFile(containerName: string, fileName: string, file: File): Promise<void> {
    try {
      var client = this.blobServiceClient;
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: {
          blobContentType: file.type
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}
