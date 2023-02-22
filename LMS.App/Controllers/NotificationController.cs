using LMS.Common.ViewModels.Notification;
using LMS.Data.Entity;
using LMS.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
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

        //[Route("saveNotifications")]
        //[HttpPost]
        //public async Task<IActionResult> SaveNotification()
        //{
        //    var response = await _notificationService.SaveNotification();
        //    return Ok(response);
        //}

        [Route("getNotifications")]
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _notificationService.GetNotifications(userId);
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

    }
}
