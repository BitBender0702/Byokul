using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Course;
using LMS.Data.Entity.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class ChatUsersViewModel
    {
        public Guid UserID { get; set; }
        public string? LastMessage { get; set; }
        public Guid ChatHeadId { get; set; }
        public string? FileName { get; set;} =null;
        public DateTime Time { get; set; }
        public string? ProfileURL { get; set; }
        public string UserName { get; set; }
        public IEnumerable<ParticularChat>? Chats { get; set; }
        public SchoolUpdateViewModel School { get; set; }
        public ClassViewModel Class { get; set; }
        public CourseViewModel Course { get; set; }
        public ChatType ChatType { get; set; }
        public bool IsPinned { get; set; } = false;
    }
}
