﻿using LMS.Data.Entity.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class ParticularChat
    {
        //public string? FileName { get; set; }
        //public string? FileUrl { get; set; }
        //public FileTypeEnum? FileType { get; set; }
        public List<AttachmentViewModel> Attachment { get; set; }
        public string? Text { get; set; }
        public DateTime Time { get; set; }
        public bool SendByMe { get; set; }
        public string MyProperty { get; set; }

    }
}