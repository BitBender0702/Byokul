﻿using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Blob
{
    public interface IBlobService
    {
        Task<string> UploadFileAsync(IFormFile asset, string containerName,bool showProgress);
        Task<string> UploadFileAsync(Stream asset, string containerName, bool showProgress);
        Task<string> DownloadJsonAsync(string filetoDownload, string azure_ContainerName);
        Task<bool> DeleteFile(string fileName, string containerName);
        Task<string> UploadVideoAsync(Stream stream, string containerName, string fileName, string fileType);
        Task<byte[]> GetFileContentAsync(string containerName, string fileName);
        Task<string> CompressAndUploadFileAsync(IFormFile asset, string containerName, bool showProgress);
    }
}
