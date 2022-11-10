﻿using LMS.Common.ViewModels.School;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class PostDetailsViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public int? Status { get; set; }
        public Guid OwnerId { get; set; }
        public Guid AuthorId { get; set; }
        public DateTime? DateTime { get; set; }
        public int PostType { get; set; }
        public string Description { get; set; }
        public int PostAuthorType { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public IEnumerable<PostTagViewModel> PostTags { get; set; }
        public Guid ParentId { get; set; }
        public OwnerViewModel Owner { get; set; }
        public AuthorViewModel Author { get; set; }
        public string? CoverLetter { get; set; }
        public IEnumerable<PostAttachmentViewModel> PostAttachments { get; set; }
    }
}
