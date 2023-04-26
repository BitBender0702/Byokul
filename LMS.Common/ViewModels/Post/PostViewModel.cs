﻿using LMS.Common.ViewModels.FileStorage;
using LMS.Common.ViewModels.School;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class PostViewModel
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
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
        public IEnumerable<IFormFile> PostAttachments { get; set; }
        public IEnumerable<string> PostTags { get; set; }
        public Guid ParentId { get; set; }
        public string? CoverLetter { get; set; }
        public List<IFormFile> UploadImages { get; set; }
        public List<IFormFile> UploadVideos { get; set; }
        public List<IFormFile> UploadAttachments { get; set; }
        public IFormFile UploadReels { get; set; }
        public bool IsPinned { get; set; }
        public Boolean IsCommentsDisabled { get; set; }
        public List<IFormFile> UploadVideosThumbnail { get; set; }
        public IEnumerable<string> UploadFromFileStorage { get; set; }

    }
}
