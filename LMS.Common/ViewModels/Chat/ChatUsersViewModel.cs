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
    }
}
