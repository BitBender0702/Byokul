using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Notification
{
    public class NotificationSettingViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Boolean Active { get; set; }
        public int Type { get; set; }
        public DateTime DateTime { get; set; }
        public Boolean IsSettingActive { get; set; }
        public NotificationTypeEnum NotificationType { get; set; }
    }
}
