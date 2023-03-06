using LMS.Common.Enums;
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using LMS.Services;
using LMS.Services.Blob;
using LMS.Services.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("users")]
    public class UserController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IUserService _userService;
        private readonly IChatService _chatService;
        private readonly IBlobService _blobService;
        private IConfiguration _config;


        public UserController(UserManager<User> userManager, IUserService userService, IChatService chatService, IBlobService blobService, IConfiguration config)
        {
            _userManager = userManager;
            _userService = userService;
            _chatService = chatService;
            _blobService = blobService;
            _config = config;
        }


        [Route("getUser")]
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetUser(string? userId)
        {
            var response = await _userService.GetUserById(userId);
            return Ok(response);
        }

        [Route("getUserEditDetails")]
        [HttpGet]
        public async Task<IActionResult> GetUserEditDetails(string userId)
        {
            var response = await _userService.GetUserEditDetails(userId);
            return Ok(response);
        }

        [Route("followUnfollowUser")]
        [HttpPost]
        public async Task<IActionResult> FollowUnFollowUser([FromBody] FollowUnFollowViewModel model)
        {
            var followerId = await GetUserIdAsync(this._userManager);
            var response = await _userService.FollowUnFollowUser(model, followerId);
            return Ok(response);
        }

        [Route("saveUserLanguages")]
        [HttpPost]
        public async Task<IActionResult> SaveUserLanguages([FromBody] UserLanguageViewModel userLanguageViewModel)
        {
            //userLanguageViewModel.UserId = await GetUserIdAsync(this._userManager);
            await _userService.SaveUserLanguages(userLanguageViewModel);
            return Ok();
        }

        [Route("deleteUserLanguage")]
        [HttpPost]
        public async Task<IActionResult> DeleteUserLanguage([FromBody] UserLanguageDeleteViewModel model)
        {
            //model.UserId = await GetUserIdAsync(this._userManager);
            await _userService.DeleteUserLanguage(model);
            return Ok();
        }

        [Route("updateUser")]
        [HttpPost]
        public async Task<IActionResult> UpdateUser(UserUpdateViewModel userUpdateViewModel)
        {
            var response = await _userService.UpdateUser(userUpdateViewModel);
            return Ok(response);
        }

        [Route("countryList")]
        [HttpGet]
        public async Task<IActionResult> CountryList()
        {
            return Ok(await _userService.CountryList());
        }

        [Route("cityList")]
        [HttpGet]
        public async Task<IActionResult> CityList(Guid countryId)
        {
            return Ok(await _userService.CityList(countryId));
        }

        [Route("myFeed")]
        [HttpGet]
        public async Task<IActionResult> MyFeed(PostTypeEnum postType,int pageNumber)
        {
            var userId = await GetUserIdAsync(this._userManager);
            return Ok(await _userService.GetMyFeed(userId,postType, pageNumber));
        }

        [Route("userProfileFeed")]
        [HttpGet]
        public async Task<IActionResult> UserProfileFeed(string userId)
        {
            return Ok(await _userService.GetUserProfileFeed(userId));
        }

        [Route("userFollowers")]
        [HttpGet]
        public async Task<IActionResult> UserFollowers(string userId)
        {
            return Ok(await _userService.GetUserFollowers(userId));
        }

        [AllowAnonymous]
        [Route("getBasicUserInfo")]
        [HttpGet]
        public async Task<IActionResult> GetBasicUserInfo(string userId)
        {
            var user = await _userService.GetBasicUserInfo(userId);
            return Ok(user);
        }

        [Route("banFollower")]
        [HttpPost]
        public async Task<IActionResult> BanFollower(string followerId)
        {
            var reponse = await _userService.BanFollower(followerId);
            return Ok(reponse);
        }

        [Route("globalFeed")]
        [HttpGet]
        public async Task<IActionResult> GlobalFeed(PostTypeEnum postType, int pageNumber)
        {
            var userId = await GetUserIdAsync(this._userManager);
            return Ok(await _userService.GetGlobalFeed(userId,postType,pageNumber));
        }

        [Route("saveUserPreference")]
        [HttpPost]
        public async Task<IActionResult> SaveUserPreference(string preferenceString)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var reponse = await _userService.SaveUserPreference(userId,preferenceString);
            return Ok(reponse);
        }

        [Route("getChatHead")]
        [HttpGet]
        public async Task<IActionResult> GetChatHead(Guid senderId, Guid receiverId,ChatType chatType)
        {
            var response = await _chatService.GetChatHead(senderId, receiverId, chatType);
            return Ok(response);
        }

        [Route("saveChatAttachments")]
        [HttpPost]
        public async Task<IActionResult> SaveChatAttachments(SaveChatAttachmentViewModel model)
        {
            var response = await _chatService.SaveChatAttachments(model);
            return Ok(response);
        }

        [Route("getPostsByUserId")]
        [HttpGet]
        public async Task<IActionResult> GetPostsByUserId(string userId, int pageNumber, int pageSize = 4)
        {
            var response = await _userService.GetPostsByUserId(userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getReelsByUserId")]
        [HttpGet]
        public async Task<IActionResult> GetReelsByUserId(string userId, int pageNumber, int pageSize = 4)
        {
            var response = await _userService.GetReelsByUserId(userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getCertificatePdf")]
        [HttpGet]
        public async Task<IActionResult> GetCertificatePdf(string certificateName, int from)
        {
            string containerName = "";
            if (from == (int)PostAuthorTypeEnum.School)
            {
                containerName = this._config.GetValue<string>("Container:SchoolContainer");
            }
            if (from == (int)PostAuthorTypeEnum.Class)
            {
                containerName = this._config.GetValue<string>("Container:ClassContainer");
            }
            if (from == (int)PostAuthorTypeEnum.Course)
            {
                containerName = this._config.GetValue<string>("Container:CourseContainer");
            }
            var response = await _blobService.GetFileContentAsync(containerName, certificateName);
            return Ok(response);
        }

        [AllowAnonymous]
        [Route("getUserByEmail")]
        [HttpGet]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            var user = await _userService.GetUserByEmail(email);
            return Ok(user);
        }


    }
}
