using LMS.Common.Enums;
using LMS.Data.Entity.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class ParticularChat
    {
        public List<AttachmentViewModel> Attachment { get; set; }
        public string? Text { get; set; }
        public DateTime Time { get; set; }
        public bool SendByMe { get; set; }
        public Guid Id { get; set; }
        public Guid? ReplyChatId { get; set; }
        public string ReplyChatContent { get; set; }
        public int? ReplyMessageType { get; set; }
        public string FileName { get; set; }
        public bool? IsForwarded { get; set; }

    }
}
