using LMS.Data.Entity.Chat;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class Notification
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public string? ActionDoneBy { get; set; }
        [ForeignKey("ActionDoneBy")]
        public User User { get; set; }
        public string? Avatar { get; set; }
        public Boolean IsRead { get; set; }
        public DateTime? DateTime { get; set; }
        public string NotificationContent { get; set; }
        public NotificationTypeEnum NotificationType { get; set; }
        public Guid? PostId { get; set; }
        public Post? Post { get; set; }
        public int? PostType { get; set; }
        public Guid? ReelId { get; set; }
        public ChatType? ChatType { get; set; }
        public Guid? ChatTypeId { get; set; }
        public string? MeetingId { get; set; }
    }

    public enum NotificationTypeEnum
    {
        Likes = 1,
        Followings = 2,
        StatusChanges = 3,
        LectureStart = 4,
        Messages = 5,
        AssignTeacher = 6,
        CertificateSent = 7,
        Transaction = 8,
        Report = 9,
        PostUploaded = 10,
        FilesUploaded = 11,
        TeacherAdded = 12,
        NotifyStorageExceed = 13

    }
}
