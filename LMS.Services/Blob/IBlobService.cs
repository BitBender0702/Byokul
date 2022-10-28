using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Blob
{
    public interface IBlobService
    {
        Task<string> UploadFileAsync(IFormFile asset, string containerName);
        Task<string> DownloadJsonAsync(string filetoDownload, string azure_ContainerName);
        Task<bool> DeleteFile(string fileName, string containerName);
        Task<string> UploadVideoAsync(Stream stream, string containerName, string fileName, string fileType);
    }
}
