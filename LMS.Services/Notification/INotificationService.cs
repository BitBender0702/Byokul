using LMS.Common.ViewModels.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface INotificationService
    {
        Task<List<NotificationSettingViewModel>> GetNotificationSettings(string userId);
        Task<List<FollowerNotificationSettingViewModel>> GetFollowersNotificationSettings(string followersIds);
        Task<List<NotificationViewModel>> GetNotifications(string userId, int pageNumber);
        Task<NotificationViewModel> AddNotification(NotificationViewModel model);
        Task RemoveUnreadNotifications(string userId);
        Task SaveNotificationSettings(List<NotificationSettingViewModel> model, string userId);
        Task SaveTransactionNotification(NotificationViewModel notificationViewModel);
        Task<List<string>> GetUserFollowersIds(string userId);
        Task<List<string>> GetSchoolFollowersIds(Guid schoolId);
        Task<List<string>> GetClassFollowersIds(Guid classId);


    }
}
