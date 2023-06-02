using LMS.Common.ViewModels.Notification;
using LMS.Data.Entity;
using LMS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("notifications")]
    public class NotificationController : BaseController
    {
        private readonly INotificationService _notificationService;
        private readonly UserManager<User> _userManager;

        public NotificationController(INotificationService notificationService, UserManager<User> userManager)
        {
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [Route("getNotifications")]
        [HttpGet]
        public async Task<IActionResult> GetNotifications(int pageNumber)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _notificationService.GetNotifications(userId, pageNumber);
            return Ok(response);
        }

        [Route("getNotificationSettings")]
        [HttpGet]
        public async Task<IActionResult> GetNotificationSettings(string userId)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var response = await _notificationService.GetNotificationSettings(userId);
            return Ok(response);
        }

        [Route("removeUnreadNotifications")]
        [HttpPost]
        public async Task<IActionResult> RemoveUnreadNotifications()
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _notificationService.RemoveUnreadNotifications(userId);
            return Ok();
        }

        [Route("saveNotificationSettings")]
        [HttpPost]
        public async Task<IActionResult> SaveNotificationSettings([FromBody] List<NotificationSettingViewModel> model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _notificationService.SaveNotificationSettings(model, userId);
            return Ok();
        }

        [Route("getUserFollowersIds")]
        [HttpGet]
        public async Task<IActionResult> GetUserFollowersIds(string userId)
        {
            var response = await _notificationService.GetUserFollowersIds(userId);
            return Ok(response);
        }

        [Route("getSchoolFollowersIds")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolFollowersIds(Guid schoolId)
        {
            var response = await _notificationService.GetSchoolFollowersIds(schoolId);
            return Ok(response);
        }

        [Route("getClassFollowersIds")]
        [HttpGet]
        public async Task<IActionResult> GetClassFollowersIds(Guid classId)
        {
            var response = await _notificationService.GetClassFollowersIds(classId);
            return Ok(response);
        }

        [Route("getFollowersNotificationSettings")]
        [HttpGet]
        public async Task<IActionResult> GetFollowersNotificationSettings(string followersIds)
        {
            var response = await _notificationService.GetFollowersNotificationSettings(followersIds);
            return Ok(response);
        }

    }
}
