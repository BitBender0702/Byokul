using LMS.Data.Entity.Chat;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class ChatMessageViewModel
    {
        public Guid Id { get; set; }
        public Guid? ChatHeadId { get; set; } 
        public Guid Sender { get; set; }
        public Guid Receiver { get; set; }           
        public ChatType ChatType { get; set; }
        public Guid? ChatTypeId { get; set; }  // school, course id
        public string Message { get; set; }
        public List<AttachmentViewModel>? Attachments { get; set; }
    }

    public class AttachmentViewModel
    {
        public FileTypeEnum FileType { get; set; }
        public string FileName { get; set; }
        public string FileURL { get; set; }
    }
}
