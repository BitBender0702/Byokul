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
        public Guid? ReplyMessageId { get; set; }
        public string? ReplyChatContent { get; set; }
        public int? ReplyMessageType { get; set; }
        public string? FileName { get; set; }
        public string? FileURL { get; set; }
        public bool? IsForwarded { get; set; }
        public string? ForwardedFileName { get; set; }
        public string? ForwardedFileURL { get; set; }
        public FileTypeEnum? ForwardedFileType { get; set; }
        public List<AttachmentViewModel>? Attachments { get; set; }
        public Guid? SchoolId { get; set; }
        public bool? IsSchoolOwner { get; set; }
    }

    public class AttachmentViewModel
    {
        public Guid Id { get; set; }
        public FileTypeEnum FileType { get; set; }
        public string FileName { get; set; }
        public string FileURL { get; set; }
        public bool? IsForwarded { get; set; }

    }
}
