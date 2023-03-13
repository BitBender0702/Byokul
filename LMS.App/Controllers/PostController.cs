using LMS.Common.Enums;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Blob;
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

        [Route("savePost")]
        [HttpPost]
        public async Task<IActionResult> SavePost(PostViewModel postViewModel)
        {
            var userId = await GetUserIdAsync(this._userManager);
            if (postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.School)
            {
                postViewModel.OwnerId = new Guid(userId);
            }

            if (postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.Class || postViewModel.PostAuthorType == (int)PostAuthorTypeEnum.Course)
            {
                postViewModel.AuthorId = new Guid(userId);
            }
            var response = await _postService.SavePost(postViewModel, userId);
            return Ok(response);
        }

        //[AllowAnonymous]
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

        [AllowAnonymous]
        [Route("likeUnlikePost")]
        [HttpPost]
        public async Task<IActionResult> LikeUnlikePost([FromBody] LikeUnlikeViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.UserId = userId;
            var response = await _postService.LikeUnlikePost(model);
            return Ok(response);
        }

        [AllowAnonymous]
        [Route("postView")]
        [HttpPost]
        public async Task<IActionResult> PostView([FromBody] PostViewsViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.UserId = userId;
            var response = await _postService.PostView(model);
            return Ok(response);
        }

        [AllowAnonymous]
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

    }
}
