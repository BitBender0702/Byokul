using LMS.Common.ViewModels.FileStorage;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.FileStorage;
using LMS.Services.UserDashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("videoLibrary")]
    public class VideoLibraryController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IVideoLibraryService _videoStorageService;

        public VideoLibraryController(UserManager<User> userManager, IVideoLibraryService videoStorageService)
        {
            _userManager = userManager;
            _videoStorageService = videoStorageService;
        }

        [Route("getSchoolLibraryVideos")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolLibraryVideos(Guid schoolId)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var response = await _videoStorageService.GetSchoolLibraryVideos(schoolId);
            return Ok(response);
        }

        [Route("deleteFile")]
        [HttpGet]
        public async Task<IActionResult> DeleteFile(Guid fileId)
        {
            return Ok(await _videoStorageService.DeleteFile(fileId));
        }

        [Route("saveFile")]
        [HttpPost]
        public async Task<IActionResult> SaveFile(VideoLibraryViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.BlobUrls = JsonConvert.DeserializeObject<BlobUrlsViewModel>(model.BlobUrlsJson);
            var response = await _videoStorageService.SaveFile(model, userId);
            return Ok(response);
        }
    }
}
