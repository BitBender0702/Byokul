using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Public_Chat.ReqDto;

namespace LMS.App.Controllers
{
    [Route("users")]
    public class UserController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IUserService _userService;


        public UserController(UserManager<User> userManager, IUserService userService)
        {
            _userManager = userManager;
            _userService = userService;
        }
    

        [Route("getUser")]
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
            string userId = await _userService.UpdateUser(userUpdateViewModel);
            return Ok(new { userId = userId });
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
        public async Task<IActionResult> MyFeed()
        {
            var userId = await GetUserIdAsync(this._userManager);
            return Ok(await _userService.GetMyFeed(userId));
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

    }
}
