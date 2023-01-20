using LMS.Common.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class SaveChatAttachmentViewModel
    {
        public string FileType { get; set; }
        public IFormFile File { get; set; }
    }
}
