using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
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
        public async Task<IActionResult> SavePost([FromBody] PostViewModel postViewModel)
        {
            var userId = await GetUserIdAsync(this._userManager);
            string url = await _postService.SavePost(postViewModel, userId);
            if (url != null)
            {
                return Ok(new { url = url });
            }
            return Ok();
        }

    }
}
