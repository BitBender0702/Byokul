using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Blob
{
    public class BlobService : IBlobService
    {
        private readonly IOptions<BlobConfig> config;
        public BlobService(IOptions<BlobConfig> config)
        {
            this.config = config;
        }

        public async Task<string> UploadFileAsync(IFormFile asset, string containerName)
        {
            string imageFullPath = null;
            if (asset == null)
            {
                return null;
            }
            try
            {
                if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount cloudStorageAccount))
                {
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);
                    await cloudBlobContainer.CreateIfNotExistsAsync();
                    await cloudBlobContainer.SetPermissionsAsync(new BlobContainerPermissions
                    {
                        PublicAccess = BlobContainerPublicAccessType.Blob
                    });
                    var filename = Guid.NewGuid() + asset.FileName;
                    CloudBlockBlob blockBlob = cloudBlobContainer.GetBlockBlobReference(filename);
                    await blockBlob.UploadFromStreamAsync(asset.OpenReadStream());
                    imageFullPath = blockBlob.Uri.ToString();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return imageFullPath;
        }

        public async Task<string> UploadVideoAsync(Stream stream, string containerName,
            string fileName, string fileType)
        {
            try
            {
                if (stream == null)
                    return null;
                if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount cloudStorageAccount))
                {
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);
                    await cloudBlobContainer.CreateIfNotExistsAsync();
                    await cloudBlobContainer.SetPermissionsAsync(new BlobContainerPermissions
                    {
                        PublicAccess = BlobContainerPublicAccessType.Blob
                    });

                    fileName = $"{fileName}.{fileType}";
                    var blockBlob = cloudBlobContainer.GetBlockBlobReference(fileName);
                    await blockBlob.UploadFromStreamAsync(stream);

                    return blockBlob.Uri.ToString();
                }
                return null;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteFile(string fileName, string containerName)
        {
            var index = fileName.LastIndexOf("/") + 1;
            fileName = fileName.Substring(index);
            try
            {
                if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount storageAccount))
                {
                    CloudBlobClient BlobClient = storageAccount.CreateCloudBlobClient();

                    CloudBlobContainer container = BlobClient.GetContainerReference(containerName);


                    if (await container.ExistsAsync())
                    {
                        CloudBlob file = container.GetBlobReference(fileName);

                        if (await file.ExistsAsync())
                        {
                            await file.DeleteAsync();
                            return true;
                        }
                    }
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> DownloadJsonAsync(string filetoDownload, string azure_ContainerName)
        {
            try
            {
                if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount cloudStorageAccount))
                {
                    CloudBlobClient blobClient = cloudStorageAccount.CreateCloudBlobClient();

                    CloudBlobContainer container = blobClient.GetContainerReference(azure_ContainerName);
                    CloudBlockBlob cloudBlockBlob = container.GetBlockBlobReference(filetoDownload);
                    var json = await cloudBlockBlob.DownloadTextAsync();

                    return json;
                }
                return ("");
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public async Task<byte[]> GetFileContentAsync(string containerName, string fileName)
        {
            if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount cloudStorageAccount))
                    {
                CloudBlobClient blobClient = cloudStorageAccount.CreateCloudBlobClient();

                CloudBlobContainer container = blobClient.GetContainerReference(containerName);
                CloudBlockBlob cloudBlockBlob = container.GetBlockBlobReference(fileName);
                using (var ms = new MemoryStream())
                {
                    if (await cloudBlockBlob.ExistsAsync())
                    {
                        await cloudBlockBlob.DownloadToStreamAsync(ms);
                    }
                    return ms.ToArray();
                }

                return null;
            }
            else
            {
                return null;
            }
        }
    }
}
