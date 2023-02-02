using LMS.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class ChatAttachmentResponse
    {
        public string FileURL { get; set; }
        public string FileName { get; set; }
        public int FileType { get; set; }
    }
}
