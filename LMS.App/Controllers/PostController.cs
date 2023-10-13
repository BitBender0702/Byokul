using Abp.Domain.Repositories;
using Hangfire;
using iText.IO.Util;
using LMS.Common.Enums;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Org.BouncyCastle.Ocsp;
using System.Collections;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("posts")]
    public class PostController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IPostService _postService;
        private readonly IBlobService _blobService;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public PostController(UserManager<User> userManager,
            IPostService postService, IBlobService blobService, IWebHostEnvironment webHostEnvironment)
        {
            _userManager = userManager;
            _postService = postService;
            _blobService = blobService;
            _webHostEnvironment = webHostEnvironment;
        }

        //[DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue, ValueLengthLimit = int.MaxValue)]
        //[Route("uploadOnBlob")]
        //[HttpPost]
        //public async Task<IActionResult> UploadOnBlob()
        //{
        //    var formCollection = await Request.ReadFormAsync();
        //    var uploadVideo = formCollection.Files[0];
        //    string containerName = "posts";
        //    var reponse = await _blobService.UploadFileAsync(uploadVideo, containerName, true);
        //    return Ok("success");

        //}

        //[DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue, ValueLengthLimit = int.MaxValue)]
        //[Route("uploadOnServer")]
        //[HttpPost]
        //public async Task<IActionResult> UploadOnServer()
        //{
        //    var formCollection = await Request.ReadFormAsync();
        //    var uploadVideo = formCollection.Files[0];
        //    byte[] byteArray;
        //    using (var memoryStream = new MemoryStream())
        //    {
        //        await uploadVideo.CopyToAsync(memoryStream);
        //        byteArray = memoryStream.ToArray();
        //    }

        //    var path = _webHostEnvironment.ContentRootPath;
        //    var tempDirectoryPath = Path.Combine(path, "FfmpegVideos/");
        //    var fileName = Guid.NewGuid().ToString();
        //    System.IO.File.WriteAllBytes(tempDirectoryPath + fileName + "test.mp4", byteArray);
        //    return Ok("success");
        //}

        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Route("uploadPost")]
        [HttpPost]
        public async Task<IActionResult> UploadPost(PostViewModel postViewModel)
            {
            var userId = await GetUserIdAsync(this._userManager);
            postViewModel.BlobUrls = JsonConvert.DeserializeObject<List<BlobUrlsViewModel>>(postViewModel.BlobUrlsJson);
            if (postViewModel.Id != null && postViewModel.Id != new Guid())
            {
                var response = await _postService.UpdatePost(postViewModel, userId);
                return Ok(response);
            }
            else
            {
                postViewModel.CreatedBy = userId;
                postViewModel.CreatedOn = DateTime.UtcNow;
                postViewModel.IsDeleted = false;
                postViewModel.IsPinned = false;
                postViewModel.IsCommentsDisabled = false;
                var response = await _postService.SavePost(postViewModel, userId);
                return Ok(response);
            }
        }

        //[HttpPost, DisableRequestSizeLimit]
        //[Route("uploadPost")]
        //public async Task<IActionResult> SavePost()
        //{
        //    var response = new PostViewModel();

        //    var formCollection = await Request.ReadFormAsync();
        //    var imagesFiles = formCollection.Files.GetFiles("uploadImages");
        //    var AuthorId = formCollection["AuthorId"];


        //    var userId = await GetUserIdAsync(this._userManager);
        //    if (postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.School)
        //    {
        //        postViewModel.OwnerId = new Guid(userId);
        //    }

        //    if (postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.Class || postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.Course)
        //    {
        //        postViewModel.AuthorId = new Guid(userId);
        //    }
        //    response = await _postService.SavePost(postViewModel, userId);
        //    //}
        //    return Ok(response);
        //}

        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Route("savePost")]
        [HttpPost]
        public async Task<IActionResult> SavePost(PostViewModel postViewModel)
        {
            var response = new PostViewModel();
            var userId = await GetUserIdAsync(this._userManager);
            if (postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.School)
            {
                postViewModel.OwnerId = new Guid(userId);
            }

            if (postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.Class || postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.Course)
            {
                postViewModel.AuthorId = new Guid(userId);
            }
            response = await _postService.SavePost(postViewModel, userId);
            //}
            return Ok(response);
        }

        [Route("getReelById")]
        [HttpGet]
        public async Task<IActionResult> GetReelById(Guid id)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _postService.GetReelById(id, userId);
            return Ok(response);
        }

        [AllowAnonymous]
        [Route("getPostById")]
        [HttpGet]
        public async Task<IActionResult> GetPostById(Guid id)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _postService.GetPostById(id, userId);
            return Ok(response);
        }

        [Route("pinUnpinPost")]
        [HttpPost]
        public async Task<IActionResult> PinUnpinPost(Guid postId, bool isPinned)
        {
            var response = await _postService.PinUnpinPost(postId, isPinned);
            if (response == Constants.PostPinnedSuccessfully)
            {
                return Ok(new { Success = true, Message = Constants.PostPinnedSuccessfully });
            }
            else if (response == Constants.PostUnPinnedSuccessfully)
            {
                return Ok(new { Success = true, Message = Constants.PostUnPinnedSuccessfully });
            }

            return Ok(new { Success = true, Message = Constants.PostIdInvalid });
        }

        [Route("likeUnlikePost")]
        [HttpPost]
        public async Task<IActionResult> LikeUnlikePost([FromBody] LikeUnlikeViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.UserId = userId;
            if (userId == null)
            {
                return BadRequest($"User doesnot exist for the id: {userId}");
            }
            var response = await _postService.LikeUnlikePost(model);
            if (response != null)
            {
                return Ok(response);
            }
            else
            {
                return BadRequest($"Post does not exist for the postId: {model.PostId}");
            }
        }

        [Route("postView")]
        [HttpPost]
        public async Task<IActionResult> PostView([FromBody] PostViewsViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.UserId = userId;
            var response = await _postService.PostView(model);
            return Ok(response);
        }

        [Route("likeUnlikeComment")]
        [HttpPost]
        public async Task<IActionResult> LikeUnlikeComment(Guid commentId, bool isLike)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _postService.LikeUnlikeComment(commentId, isLike, userId);
            return Ok(response);
        }

        [Route("enableDisableComments")]
        [HttpPost]
        public async Task<IActionResult> EnableDisableComments(Guid postId, bool isHideComments)
        {
            await _postService.EnableDisableComments(postId, isHideComments);
            return Ok();
        }

        [Route("saveUserSharedPost")]
        [HttpPost]
        public async Task<IActionResult> SaveUserSharedPost(string userId, Guid postId)
        {
            await _postService.SaveUserSharedPost(userId, postId);
            return Ok();
        }

        [Route("savePostByUser")]
        [HttpPost]
        public async Task<IActionResult> SavePostByUser(string userId, Guid postId)
        {
            var isSaved = await _postService.SavePostByUser(userId, postId);
            if (isSaved == false)
            {
                return Ok(new { Success = true, Message = Constants.PostUnsavedSavedSuccessully });
            }
            if (isSaved == true)
            {
                return Ok(new { Success = true, Message = Constants.PostSavedSuccessully });
            }
            return Ok();
        }

        [Route("getSavedPostsByUser")]
        [HttpPost]
        public async Task<IActionResult> GetSavedPostsByUser(string userId, int pageNumber, PostTypeEnum type)
        {
            var response = await _postService.GetSavedPostsByUser(userId, pageNumber, type);
            return Ok(response);
        }

        [Route("getSharedPostsByUser")]
        [HttpPost]
        public async Task<IActionResult> GetSharedPostsByUser(string userId, int pageNumber, PostTypeEnum type)
        {
            var response = await _postService.GetSharedPostsByUser(userId, pageNumber, type);
            return Ok(response);
        }

        [Route("getLikedPostsByUser")]
        [HttpPost]
        public async Task<IActionResult> GetLikedPostsByUser(string userId, int pageNumber, PostTypeEnum type)
        {
            var response = await _postService.GetLikedPostsByUser(userId, pageNumber, type);
            return Ok(response);
        }

        [Route("pinUnpinSavedPost")]
        [HttpPost]
        public async Task<IActionResult> PinUnpinSavedPost(Guid postId, bool isPinned)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _postService.PinUnpinSavedPost(postId, isPinned, userId);
            return Ok(response);
        }

        //[Route("pinUnpinSharedPost")]
        //[HttpPost]
        //public async Task<IActionResult> PinUnpinSharedPost(Guid attachmentId, bool isPinned)
        //{
        //    var response = await _postService.PinUnpinSharedPost(attachmentId, isPinned);
        //    return Ok(response);
        //}

        [Route("pinUnpinLikedPost")]
        [HttpPost]
        public async Task<IActionResult> PinUnpinLikedPost(Guid postId, bool isPinned)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _postService.PinUnpinLikedPost(postId, isPinned, userId);
            return Ok(response);
        }

        [Route("deletePost")]
        [HttpPost]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            await _postService.DeletePost(id);
            return Ok();
        }

        [Route("updateCommentThrottling")]
        [HttpPost]
        public async Task<IActionResult> UpdateCommentThrottling(Guid postId, int noOfComments)
        {
            await _postService.UpdateCommentThrottling(postId, noOfComments);
            return Ok();
        }

        [Route("saveStreamAsPost")]
        [HttpPost]
        public async Task<IActionResult> SaveStreamAsPost(Guid postId)
        {
            await _postService.SaveStreamAsPost(postId);
            return Ok();
        }

        [Route("saveLiveVideoTime")]
        [HttpPost]
        public async Task<IActionResult> SaveLiveVideoTime(Guid postId, float videoTotalTime, float videoLiveTime)
        {
            await _postService.SaveLiveVideoTime(postId, videoTotalTime, videoLiveTime);
            return Ok();
        }

        [Route("enableLiveStream")]
        [HttpPost]
        public async Task<IActionResult> EnableLiveStream(Guid postId)
        {
            var isStreamEnable = await _postService.EnableLiveStream(postId);
            if (isStreamEnable)
            {
                return Ok(new { Success = true, Message = Constants.EnabledLiveStreamSuccessully });
            }
            return Ok(new { Success = true, Message = Constants.LiveStreamEnableFailed });
        }

        [Route("postsGlobalSearch")]
        [HttpGet]
        public async Task<IActionResult> PostsGlobalSearch(string searchString, int pageNumber, int pageSize)
        {
            var user = await _postService.PostsGlobalSearch(searchString, pageNumber, pageSize);
            return Ok(user);
        }



    }
}
