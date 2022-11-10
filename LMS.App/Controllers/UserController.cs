using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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
        [HttpPost]
        public async Task<IActionResult> GetUser(string userId)
        {
            var response = await _userService.GetUserById(userId);
            return Ok(response);
        }

        [Route("saveUserFollower")]
        [HttpPost]
        public async Task<IActionResult> SaveUserFollower(string userId)
        {
            var followerId = await GetUserIdAsync(this._userManager);
            await _userService.SaveUserFollower(userId, followerId);
            return Ok("success");
        }

        [Route("saveUserLanguages")]
        [HttpPost]
        public async Task<IActionResult> SaveUserLanguages([FromBody] UserLanguageViewModel userLanguageViewModel)
        {
            userLanguageViewModel.UserId = await GetUserIdAsync(this._userManager);
            await _userService.SaveUserLanguages(userLanguageViewModel);
            return Ok("success");
        }

        [Route("deleteUserLanguage")]
        [HttpPost]
        public async Task<IActionResult> DeleteUserLanguage([FromBody] UserLanguageDeleteViewModel model)
        {
            model.UserId = await GetUserIdAsync(this._userManager);
            await _userService.DeleteUserLanguage(model);
            return Ok("success");
        }

        [Route("updateUser")]
        [HttpPost]
        public async Task<IActionResult> UpdateUser([FromBody] UserUpdateViewModel userUpdateViewModel)
        {
            await _userService.UpdateUser(userUpdateViewModel);
            return Ok("success");
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

    }
}
