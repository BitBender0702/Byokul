using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using LMS.Services.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Blob
{
    public class BlobService : IBlobService
    {
        private readonly IOptions<BlobConfig> config;
        private readonly IHubContext<ChatHubs> _hubContext;
        private IConfiguration _configuration;
        private bool _isProgress;
        private int _uploadFileSize;
        private readonly ICommonService _commonService;
        public BlobService(IOptions<BlobConfig> config, IHubContext<ChatHubs> hubContext, IConfiguration configuration, ICommonService commonService)
        {
            this.config = config;
            _hubContext = hubContext;
            _configuration = configuration;
            _commonService = commonService;
        }

        public async Task<string> UploadFileAsync(IFormFile asset, string containerName, bool showProgress)
        {
            _isProgress = showProgress;
            _uploadFileSize = (int)asset.Length;
            byte[] byteArray;
            Stream streamResult;
            var fileType = Path.GetExtension(asset.FileName);
            byte[] buffer = new byte[2000000];
            int bytesRead;
            IProgress<float> progress = null;
            string imageFullPath = null;
            if (asset == null)
            {
                return null;
            }
            try
            {

                if (asset.ContentType == "video/mp4" || asset.ContentType == "video/webm" || asset.ContentType == "video/ogg" || asset.ContentType == " video/mpeg")
                {

                    // get byte array
                    using (var memoryStream = new MemoryStream())
                    {
                        await asset.CopyToAsync(memoryStream);
                        byteArray = memoryStream.ToArray();
                    }

                    streamResult = await _commonService.CompressVideo(asset.FileName, byteArray);
                }
                else
                {
                    streamResult = asset.OpenReadStream();
                }

                streamResult = asset.OpenReadStream();
                var serviceClient = new BlobServiceClient("DefaultEndpointsProtocol=https;AccountName=byokulstorage;AccountKey=exYHA69x6yj0g9ET7+0ODXjs1zPYtqAqCkiwUuT7ocLG3qQOFhWKEn9Q+oS6EC6qcT+AJM+Cj8KR+ASt+3Lu5Q==;EndpointSuffix=core.windows.net");
                var containerClient = serviceClient.GetBlobContainerClient(containerName);

                var blobClient = containerClient.GetBlobClient(Guid.NewGuid().ToString());


                BlobUploadOptions op = new BlobUploadOptions
                {
                    TransferOptions = new StorageTransferOptions
                    {
                        MaximumTransferSize = 4 * 1024 * 1024,
                        InitialTransferSize = 4 * 1024 * 1024,
                        MaximumConcurrency = 5
                    },
                    HttpHeaders = new BlobHttpHeaders
                    {
                        ContentType = asset.ContentType
                    },
                    ProgressHandler = new MyProgressHandler(showProgress, _uploadFileSize, _hubContext, asset.FileName)
                };

                //var response = await blobClient.UploadAsync(asset.OpenReadStream(), op);
                var response = await blobClient.UploadAsync(streamResult, op);

                imageFullPath = blobClient.Uri.AbsoluteUri;
                //if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount cloudStorageAccount))
                //{
                //    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                //    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);
                //    await cloudBlobContainer.CreateIfNotExistsAsync();
                //    await cloudBlobContainer.SetPermissionsAsync(new BlobContainerPermissions
                //    {
                //        PublicAccess = BlobContainerPublicAccessType.Blob
                //    });
                //    var filename = Guid.NewGuid() + fileType;
                //    CloudBlockBlob blockBlob = cloudBlobContainer.GetBlockBlobReference(filename);

                //    BlobUploadOptions op = new BlobUploadOptions
                //    {
                //        TransferOptions = new StorageTransferOptions
                //        {
                //            MaximumTransferSize = 4 * 1024 * 1024,
                //            InitialTransferSize = 4 * 1024 * 1024,
                //            MaximumConcurrency = 5
                //        },
                //        HttpHeaders = new BlobHttpHeaders
                //        {
                //            ContentType = "video/mp4"
                //        },
                //        ProgressHandler = new MyProgressHandler()
                //    };

                //    using (var stream = asset.OpenReadStream())
                //    {
                //        float totalBytes = stream.Length;
                //        float uploadedBytes = 0;
                //        float lastProgress = 0;

                //        var options = new BlobRequestOptions()
                //        {
                //            ParallelOperationThreadCount = 1,
                //            DisableContentMD5Validation = true,
                //            StoreBlobContentMD5 = false,
                //            MaximumExecutionTime = TimeSpan.FromMinutes(10)
                //        };

                //        while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                //        {
                //            await blockBlob.UploadFromByteArrayAsync(buffer, 0, bytesRead);
                //            uploadedBytes += bytesRead;

                //            if (showProgress)
                //            {
                //                var currentProgress = (uploadedBytes * 100 / totalBytes);
                //                if (currentProgress != lastProgress)
                //                {
                //                    await _hubContext.Clients.All.SendAsync("UpdateProgress", (int)currentProgress, asset.FileName);
                //                    lastProgress = currentProgress;
                //                }
                //            }
                //        }
                //    }

                //    imageFullPath = blockBlob.Uri.ToString();
                //}
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return imageFullPath;
        }

        public class MyProgressHandler : IProgress<long>
        {
            private bool _isProgress;
            private int _uploadFileSize;
            private readonly IHubContext<ChatHubs> _hubContext;
            private string _fileName;

            public MyProgressHandler(bool isProgress, int uploadFileSize, IHubContext<ChatHubs> hubContext, string fileName)
            {
                _isProgress = isProgress;
                _uploadFileSize = uploadFileSize;
                _hubContext = hubContext;
                _fileName = fileName;
            }
            public async void Report(long value)
            {
                _isProgress = true;
                if (_isProgress)
                {
                    var currentProgress = (value * 100 / _uploadFileSize);
                    //if (currentProgress != lastProgress)
                    //{
                    await _hubContext.Clients.All.SendAsync("UpdateProgress", currentProgress, _fileName);
                    //lastProgress = currentProgress;
                    //}
                }
                Console.WriteLine($"Bytes uploaded: {value}");
            }
        }

        //public async Task<string> UploadFileAsync(IFormFile asset, string containerName, bool showProgress)
        //{
        //    string imageFullPath = null;
        //    if (asset == null)
        //    {
        //        return null;
        //    }
        //    try
        //    {
        //        if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount cloudStorageAccount))
        //        {
        //            CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

        //            CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);
        //            await cloudBlobContainer.CreateIfNotExistsAsync();
        //            await cloudBlobContainer.SetPermissionsAsync(new BlobContainerPermissions
        //            {
        //                PublicAccess = BlobContainerPublicAccessType.Blob
        //            });
        //            var filename = Guid.NewGuid() + asset.FileName;
        //            CloudBlockBlob blockBlob = cloudBlobContainer.GetBlockBlobReference(filename);
        //            await blockBlob.UploadFromStreamAsync(asset.OpenReadStream());
        //            imageFullPath = blockBlob.Uri.ToString();
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //    return imageFullPath;
        //}


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
