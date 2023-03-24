using LMS.Common.ViewModels.FileStorage;
using LMS.Data.Entity;
using LMS.Services.FileStorage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("fileStorage")]
    public class FileStorageController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IFileStorageService _fileStorageService;

        public FileStorageController(UserManager<User> userManager, IFileStorageService fileStorageService)
        {
            _userManager = userManager;
            _fileStorageService = fileStorageService;
        }

        [Route("saveFolder")]
        [HttpPost]
        public async Task<IActionResult> SaveFolder([FromBody] FolderViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _fileStorageService.SaveFolder(model, userId);
            return Ok(response);
        }

        [Route("getFolders")]
        [HttpGet]
        public async Task<IActionResult> GetFolders(Guid parentId)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var courseId = await _fileStorageService.GetFolders(parentId); 
            return Ok(courseId);
        }

        [Route("saveFiles")]
        [HttpPost]
        public async Task<IActionResult> SaveFiles(SaveFilesViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _fileStorageService.SaveFiles(model, userId);
            return Ok(response);
        }

        [Route("getFiles")]
        [HttpGet]
        public async Task<IActionResult> GetFiles(Guid parentId)
        {
            var response = await _fileStorageService.GetFiles(parentId);
            return Ok(response);
        }

        [Route("getNestedFolders")]
        [HttpGet]
        public async Task<IActionResult> GetNestedFolders(Guid folderId)
        {
            var response = await _fileStorageService.GetNestedFolders(folderId);
            return Ok(response);
        }

    }
}
