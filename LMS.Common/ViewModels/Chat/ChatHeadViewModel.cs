using LMS.Data.Entity.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class ChatHeadViewModel
    {
        public Guid Id { get; set; }
        public string? SenderId { get; set; }
        public string? ReceiverId { get; set; }
        public string LastMessage { get; set; }
        public int UnreadMessageCount { get; set; }
        public ChatType ChatType { get; set; }
        public Guid? ChatTypeId { get; set; }
        public Guid? SchoolId { get; set; }

    }
}
