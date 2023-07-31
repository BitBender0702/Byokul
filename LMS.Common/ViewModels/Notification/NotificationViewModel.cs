using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Notification
{
    public class NotificationViewModel
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public string? ActionDoneBy { get; set; }
        public UserDetailsViewModel? User { get; set; }
        public string? Avatar { get; set; }
        public Boolean IsRead { get; set; }
        public DateTime? DateTime { get; set; }
        public string NotificationContent { get; set; }
        public NotificationTypeEnum NotificationType { get; set; }
        public Guid? PostId { get; set; }
        public PostDetailsViewModel? Post { get; set; }
        public int? PostType { get; set; }
        public string? ReelId { get; set; }
        public ChatType? ChatType { get; set; }
        public Guid? ChatTypeId { get; set; }
        public string? MeetingId { get; set; }
        public List<string>? FollowersIds { get; set; }
    }
}
