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
        public Guid Sender { get; set; }
        public Guid Receiver { get; set; }
        public string LastMessage { get; set; }
        public int UnreadMessageCount { get; set; }
        public ChatType ChatType { get; set; }
        public Guid? ChatTypeId { get; set; }
    }
}
