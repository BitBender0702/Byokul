using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class UserNotificationSetting
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }
        public Guid? NotificationSettingId { get; set; }
        public NotificationSeeting NotificationSetting { get; set; }
        public Boolean IsActive { get; set; }
    }
}
