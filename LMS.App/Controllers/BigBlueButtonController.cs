using LMS.Common.ViewModels.BigBlueButton;
using LMS.Services.BigBlueButton;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;
using LMS.Services.Common;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using LMS.Common.Enums;
using Microsoft.EntityFrameworkCore;
using LMS.Common.ViewModels.Post;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("bigBlueButton")]
    public class BigBlueButtonController : BaseController
    {
        private IConfiguration _config;
        private readonly IBigBlueButtonService _bigBlueButtonService;
        private readonly IBlobService _blobService;
        private const string JsonArrayNamespace = "http://james.newtonking.com/projects/json";
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ICommonService _commonService;
        private readonly IGenericRepository<Post> _postRepository;
        private readonly IGenericRepository<PostAttachment> _postAttachmentRepository;


        public BigBlueButtonController(IConfiguration config, IBigBlueButtonService bigBlueButtonService, IBlobService blobService, IWebHostEnvironment webHostEnvironment, ICommonService commonService, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository)
        {
            _config = config;
            _bigBlueButtonService = bigBlueButtonService;
            _blobService = blobService;
            _webHostEnvironment = webHostEnvironment;
            _commonService = commonService;
            _postRepository = postRepository;
            _postAttachmentRepository = postAttachmentRepository;
        }

        [Route("create")]
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] NewMeetingViewModel newMeetingViewModel)
        {
            var response = await _bigBlueButtonService.Create(newMeetingViewModel);
            return Ok(new { url = response.StreamUrl });
        }

        [Route("joinMeeting")]
        [HttpPost]
        public async Task<ActionResult> Join([FromBody] JoinMeetingViewModel model)
        {
            string url = await _bigBlueButtonService.Join(model);
            return Ok(new { url = url });
        }

        [Route("endMeeting")]
        [HttpPost]
        public async Task<ActionResult> EndMeeting([FromBody] EndMeetingViewModel model)
        {
            var response = await _bigBlueButtonService.EndMeeting(model);
            if (response == Constants.EndMeetingSuccess)
            {
                return Ok(new { Success = true, Message = response });
            }
            return Ok(new { Success = false, Message = response });
        }

        [Route("callBack")]
        [HttpPost]
        public async Task<IActionResult> CallBack()
        {
            var formData = Request.Form;
            var list = formData.ToList();
            var result = list.FirstOrDefault().Value.FirstOrDefault();

            var obj = JsonConvert.DeserializeObject<List<MyArray>>(result);

            if (obj.First().data.id == "rap-publish-ended")
            {
                var meetingID = obj.First().data.attributes.meeting.InternalMeetingId;
                string recordingUrl = string.Format(_config["RecordingUrl"], meetingID);
                string fileName = meetingID + "File.mp4";
                byte[] videoData = null;
                try
                {
                    var wc = new System.Net.WebClient();
                    videoData = wc.DownloadData(recordingUrl);
                    var stream = new MemoryStream(videoData);

                    var path = _webHostEnvironment.ContentRootPath;
                    var tempDirectoryPath = Path.Combine(path, "wwwroot/tmp/");

                    System.IO.File.WriteAllBytes(tempDirectoryPath + fileName, videoData);
                    string ffmpegFileName = "ffmpeg.exe";
                    string compressVid = Path.Combine(tempDirectoryPath, meetingID + "compress.mp4");

                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.WindowStyle = ProcessWindowStyle.Hidden;
                        psi.UseShellExecute = false;
                        psi.CreateNoWindow = false;
                        psi.FileName = ffmpegFileName;
                        psi.WorkingDirectory = Directory.GetCurrentDirectory();
                        psi.Arguments = $" -i {tempDirectoryPath}{fileName} -vcodec libx265 -crf 28 -acodec aac {compressVid}";

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
                    }
                    catch (Exception err)
                    {
                        Console.WriteLine("Exception Error: " + err.ToString());
                    }

                    var byteArray = System.IO.File.ReadAllBytes(compressVid);
                    var streams = new MemoryStream(byteArray);
                    string containerName = this._config.GetValue<string>("MyConfig:Container");
                    string videoUrl = await _blobService.UploadVideoAsync(streams, containerName, fileName, "mp4");
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            return Ok();
        }

        [Route("mergeVideo")]
        [HttpPost]
        public async Task<IActionResult> MergeVideo(string meetingID)
        {
            string recordingUrl = string.Format(_config["RecordingUrl"], meetingID);
            string fileName = meetingID + "File";
            byte[] videoData;
            try
            {
                var wc = new System.Net.WebClient();
                videoData = wc.DownloadData(recordingUrl);
                var stream = new MemoryStream(videoData);
                var compressedVideo = await _commonService.CompressVideo(fileName, videoData);
                string containerName = this._config.GetValue<string>("MyConfig:Container");
                string videoUrl = await _blobService.UploadVideoAsync(compressedVideo, containerName, fileName, "mp4");
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost, Route("GetMeetingVideo"), AllowAnonymous]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue, ValueLengthLimit = int.MaxValue)]
        public async Task GetMeetingVideo(IFormFile file, string meetingIds)
        {
            var fileUrl = await _blobService.UploadFileAsync(file, this._config.GetValue<string>("Container:PostContainer"), true);
            int hyphenIndex = meetingIds.IndexOf('-');
            meetingIds = meetingIds.Substring(0, hyphenIndex);
            var post = _postRepository.GetAll().Where(x => x.InternalMeetingId == meetingIds).First();
            post.PostType = (int)PostTypeEnum.Post;
            post.IsLive = false;
            _postRepository.Update(post);
            _postRepository.Save();

            var postAttachment = await _postAttachmentRepository.GetAll().Where(x => x.PostId == post.Id).FirstAsync();
            postAttachment.FileThumbnail = postAttachment.FileUrl;
            postAttachment.FileType = (int)FileTypeEnum.Video;
            postAttachment.FileUrl = fileUrl;
            _postAttachmentRepository.Update(postAttachment);
            _postAttachmentRepository.Save();
 
        }

    }

}
