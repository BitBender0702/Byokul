﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class PostAttachmentViewModel
    {
        public Guid Id { get; set; }
        public Guid? PostId { get; set; }
        public PostViewModel Post { get; set; }
        public string FileName { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public string? Attachment { get; set; }
    }
}
