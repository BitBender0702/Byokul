using LMS.Common.ViewModels.FileStorage;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.Services.Blob;
using LMS.Services.FileStorage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("fileStorage")]
    public class FileStorageController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IFileStorageService _fileStorageService;
        private readonly IBlobService _blobService;



        public FileStorageController(UserManager<User> userManager, IFileStorageService fileStorageService, IBlobService blobService)
        {
            _userManager = userManager;
            _fileStorageService = fileStorageService;
            _blobService = blobService;
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
        public async Task<IActionResult> GetFolders(Guid parentId, string? searchString)
        {
            var courseId = await _fileStorageService.GetFolders(parentId, searchString); 
            return Ok(courseId);
        }

        [DisableRequestSizeLimit,RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue,ValueLengthLimit = int.MaxValue)]
        [Route("saveFiles")]
        [HttpPost]
        public async Task<IActionResult> SaveFiles(SaveFilesViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.BlobUrls = JsonConvert.DeserializeObject<List<BlobUrlsViewModel>>(model.BlobUrlsJson);
            var response = await _fileStorageService.SaveFiles(model, userId);
             return Ok(response);
        }

        [Route("getFiles")]
        [HttpGet]
        public async Task<IActionResult> GetFiles(Guid parentId, string? searchString)
        {
            var response = await _fileStorageService.GetFiles(parentId, searchString);
            return Ok(response);
        }

        [Route("getNestedFolders")]
        [HttpGet]
        public async Task<IActionResult> GetNestedFolders(Guid folderId, string? searchString)
        {
            var response = await _fileStorageService.GetNestedFolders(folderId, searchString);
            return Ok(response);
        }

        [Route("getAttachments")]
        [HttpGet]
        public async Task<IActionResult> GetAttachments()
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _fileStorageService.GetAttachments(userId);
            return Ok(response);
        }

        [Route("isFolderNameExist")]
        [HttpGet]
        public async Task<IActionResult> IsFolderNameExist(string folderName,Guid parentId,Guid? parentFolderId)
        {
            return Ok(await _fileStorageService.IsFolderNameExist(folderName, parentId, parentFolderId));
        }

        [Route("deleteFolder")]
        [HttpGet]
        public async Task<IActionResult> DeleteFolder(Guid folderId)
        {
            var response = await _fileStorageService.DeleteFolder(folderId);
            if (response == Constants.FolderCantDeleted)
            {
                return Ok(new { Success = false, Message = response });
            }
            return Ok(new { Success = true, Message = response });
        }

        [Route("deleteFile")]
        [HttpGet]
        public async Task<IActionResult> deleteFile(Guid fileId)
        {
            return Ok(await _fileStorageService.DeleteFile(fileId));
        }

    }
}
