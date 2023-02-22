using AutoMapper;
using LMS.Common.ViewModels.Notification;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Automapper
{
    public class NotificationProfile:Profile
    {
        public NotificationProfile()
        {
            CreateMap<Notification, NotificationViewModel>();
            CreateMap<NotificationSeeting, NotificationSettingViewModel>();

        }
    }
}
