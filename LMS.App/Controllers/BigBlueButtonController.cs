using BigBlueButtonAPI.Core;
using LMS.Common.ViewModels.BigBlueButton;
using LMS.Services.BigBlueButton;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using System.Xml;
using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using LMS.Services.Common;

namespace LMS.App.Controllers
{
    [Route("bigBlueButton")]
    public class BigBlueButtonController : ControllerBase
    {
        private IConfiguration _config;
        private readonly IBigBlueButtonService _bigBlueButtonService;
        private readonly IBlobService _blobService;
        private const string JsonArrayNamespace = "http://james.newtonking.com/projects/json";
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ICommonService _commonService;
        public BigBlueButtonController(IConfiguration config, IBigBlueButtonService bigBlueButtonService, IBlobService blobService, IWebHostEnvironment webHostEnvironment, ICommonService commonService)
        {
            _config = config;
            _bigBlueButtonService = bigBlueButtonService;
            _blobService = blobService;
            _webHostEnvironment = webHostEnvironment;
            _commonService = commonService;
        }

        [Route("create")]
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] NewMeetingViewModel newMeetingViewModel)
        {
            string url = await _bigBlueButtonService.Create(newMeetingViewModel);
            return Ok(new { url = url });
        }

        [Route("join")]
        [HttpPost]
        public async Task<ActionResult> Join([FromBody] JoinMeetingViewModel model)
        {
            string url = await _bigBlueButtonService.Join(model);
            return Ok(new { url = url });
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

                //var res = _hub.Clients.All.SendAsync("transferchartdata", DataManager.GetData());
 
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

                    System.IO.File.WriteAllBytes(tempDirectoryPath + fileName,videoData);
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

                var compressedVideo = await _commonService.CompressVideo(meetingID,fileName, videoData);


                string containerName = this._config.GetValue<string>("MyConfig:Container");
                string videoUrl = await _blobService.UploadVideoAsync(compressedVideo, containerName, fileName, "mp4");
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }

}
