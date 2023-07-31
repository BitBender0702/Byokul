using System;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LMS.VideoProcess
{
    public class Function1
    {
        
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IConfiguration _configuration;
        const string _outputContainer = "userpostscompressed";

        public Function1(IHostingEnvironment hostingEnvironment, IConfiguration configuration)
        {
            _hostingEnvironment = hostingEnvironment;
            _configuration = configuration;
        }

        [FunctionName("Function1")]
        public async Task Run([BlobTrigger("userposts/{name}", Connection = "StorageConnection")] Stream stream, Uri uri, string name, ILogger log, ExecutionContext executionContext)
        {
            string ffmpegFileName = Path.Combine(executionContext.FunctionAppDirectory, "Ffmpeg", "ffmpeg.exe");

            var directoryPath = Path.Combine(executionContext.FunctionAppDirectory, "FfmpegVideos");
            if (!Directory.Exists(directoryPath)) { Directory.CreateDirectory(directoryPath); }
            var videosDirectory = Path.Combine(directoryPath, "videos");
            if (!Directory.Exists(videosDirectory)) { Directory.CreateDirectory(videosDirectory); }
            var thumbnailDirectory = Path.Combine(directoryPath, "thumbnails");
            if (!Directory.Exists(thumbnailDirectory)) { Directory.CreateDirectory(thumbnailDirectory); }
            var imagesDirectory = Path.Combine(directoryPath, "images");
            if (!Directory.Exists(imagesDirectory)) { Directory.CreateDirectory(imagesDirectory); }

            var tempFilePath = Path.Combine(directoryPath, name);

            var blobUrl = uri.ToString();
            var thumbnailName = $"{name.Substring(0, name.LastIndexOf('.'))}.png";

            if (name.ToLower().First() == 'v')
            {
                thumbnailName = thumbnailName.Replace("videos", "thumbnails");
                await ThumbnailGeneration(blobUrl, ffmpegFileName, Path.Combine(directoryPath, thumbnailName), thumbnailName);

                await VideoCompression(blobUrl, ffmpegFileName, Path.Combine(directoryPath, name), name);
            }
            else if (name.ToLower().First() == 'i')
            {
                thumbnailName = thumbnailName.Replace("images", "thumbnails");
                await CompressImage(blobUrl, ffmpegFileName, Path.Combine(directoryPath, thumbnailName), thumbnailName);
            }
        }

        public async Task ThumbnailGeneration(string blobUrl, string ffmpegFileName, string compressName, string blobName)
        {
            CompressionAlgoAndUpload($" -i {blobUrl} -vf thumbnail,scale=300:-1 -frames:v 1 {compressName}", ffmpegFileName);
            await UploadBlob(_outputContainer, compressName, blobName);
        }

        public async Task VideoCompression(string blobUrl, string ffmpegFileName, string compressName, string blobName)
        {
            CompressionAlgoAndUpload($" -i {blobUrl} -vcodec libx265 -crf 28 -tune fastdecode -preset ultrafast -threads 10 -r 23 -acodec aac {compressName}", ffmpegFileName);
            var url = await UploadBlob(_outputContainer, compressName, blobName);
            await UpdateCompressedVideoUrl(blobName, url);
        }

        public async Task CompressImage(string blobUrl, string ffmpegFileName, string compressName, string blobName)
        {
            CompressionAlgoAndUpload($" -i {blobUrl} -vf thumbnail,scale=300:-1 {compressName}", ffmpegFileName);
            await UploadBlob(_outputContainer, compressName, blobName);
        }

        public void CompressionAlgoAndUpload(string ffmpegParameters, string ffmpegFileName)
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.WindowStyle = ProcessWindowStyle.Hidden;
            psi.UseShellExecute = false;
            psi.CreateNoWindow = false;
            psi.FileName = ffmpegFileName;
            psi.WorkingDirectory = Directory.GetCurrentDirectory();
            psi.Arguments = ffmpegParameters;

            var process = new Process
            {
                StartInfo = psi,
                EnableRaisingEvents = true,

            };
            process.Exited += (sender, args) =>
            {
                process.Dispose();
            };
            process.Start();
            process.WaitForExit();
            process.Dispose();
        }

        public async Task<string> UploadBlob(string containerName, string compressName, string blobName)
        {
            using (var stream = File.OpenRead(compressName))
            {
                var connectionString = _configuration["StorageConnection"];
                if (CloudStorageAccount.TryParse(connectionString, out CloudStorageAccount cloudStorageAccount))
                {
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);
                    await cloudBlobContainer.CreateIfNotExistsAsync();
                    await cloudBlobContainer.SetPermissionsAsync(new BlobContainerPermissions
                    {
                        PublicAccess = BlobContainerPublicAccessType.Blob
                    });
                    CloudBlockBlob blockBlob = cloudBlobContainer.GetBlockBlobReference(blobName);
                    await blockBlob.UploadFromStreamAsync(stream);
                    return blockBlob.Uri.ToString();
                }
                return null;
            }
        }

        public async Task UpdateCompressedVideoUrl(string name, string url)
        {
            var id = name.Split('/').Last();
            id = id.Substring(0, id.LastIndexOf('.'));
            var connectionString = _configuration["SqlConnectionString"];

            using (var conn = new SqlConnection(connectionString))
            {
                conn.Open();
                var query = $"update PostAttachments set FileUrl = '{url}' where Id = '{id}'";
                var sqlCommand = new SqlCommand(query, conn);
                await sqlCommand.ExecuteNonQueryAsync();
            }
        }
    }
}
