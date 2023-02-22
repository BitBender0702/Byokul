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
        Task<List<NotificationViewModel>> GetNotifications(string userId);
        Task<NotificationViewModel> AddNotification(NotificationViewModel model);
        Task RemoveUnreadNotifications(string userId);
        Task SaveNotificationSettings(List<NotificationSettingViewModel> model, string userId);

    }
}
