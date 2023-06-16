using Hangfire;
using LMS.Common.Enums;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("posts")]
    public class PostController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IPostService _postService;

        public PostController(UserManager<User> userManager,
            IPostService postService)
        {
            _userManager = userManager;
            _postService = postService;
        }

        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        [Route("savePost")]
        [HttpPost]
        public async Task<IActionResult> SavePost(PostViewModel postViewModel)
        {
            var response = new PostViewModel();
            var userId = await GetUserIdAsync(this._userManager);

            if (postViewModel.DateTime != null && postViewModel.PostType != (int)PostTypeEnum.Stream)
            {
                DateTimeOffset scheduledTime = new DateTimeOffset(postViewModel.DateTime.Value);
                //var jobId = BackgroundJob.Enqueue(() => _postService.SavePost(postViewModel, userId));

                var scheduleJobId = BackgroundJob.Schedule(() => _postService.SavePost(postViewModel, userId), scheduledTime);

                //var jobId = BackgroundJob.Schedule(() => _postService.SavePost(postViewModel, userId), new TimeSpan(120));

                var monitoringApi = JobStorage.Current.GetMonitoringApi();

                // Get the job details
                var jobDetails = monitoringApi.JobDetails(scheduleJobId);

                // Get the return value type of the job
                //Type returnType = Type.GetType(jobDetails.ResultType);

            }
            else
            {
                if (postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.School)
                {
                    postViewModel.OwnerId = new Guid(userId);
                }

                if (postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.Class || postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.Course)
                {
                    postViewModel.AuthorId = new Guid(userId);
                }
                response = await _postService.SavePost(postViewModel, userId);
            }
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
        public async Task<IActionResult> PinUnpinPost(Guid attachmentId, bool isPinned)
        {
            var response = await _postService.PinUnpinPost(attachmentId, isPinned);
            return Ok(response);
        }

        [Route("likeUnlikePost")]
        [HttpPost]
        public async Task<IActionResult> LikeUnlikePost([FromBody] LikeUnlikeViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.UserId = userId;
            var response = await _postService.LikeUnlikePost(model);
            return Ok(response);
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
            await _postService.EnableDisableComments(postId,isHideComments);
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
            await _postService.SavePostByUser(userId, postId);
            return Ok();
        }

        [Route("getSavedPostsByUser")]
        [HttpPost]
        public async Task<IActionResult> GetSavedPostsByUser(string userId, int pageNumber,PostTypeEnum type)
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
        public async Task<IActionResult> PinUnpinSavedPost(Guid attachmentId, bool isPinned)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _postService.PinUnpinSavedPost(attachmentId, isPinned, userId);
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
        public async Task<IActionResult> PinUnpinLikedPost(Guid attachmentId, bool isPinned)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _postService.PinUnpinLikedPost(attachmentId, isPinned, userId);
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



    }
}
