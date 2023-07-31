using LMS.Common.ViewModels.FileStorage;
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
        public IEnumerable<string> PostTags { get; set; }
        public Guid ParentId { get; set; }
        public string? CoverLetter { get; set; }
        public bool IsPinned { get; set; }
        public Boolean IsCommentsDisabled { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public string? StreamUrl { get; set; }
        public int? CommentsPerMinute { get; set; }
        public bool? IsMicroPhoneOpen { get; set; }
        public Guid? ReelId { get; set; }
        public List<BlobUrlsViewModel> BlobUrls { get; set; }
        public string BlobUrlsJson { get; set; }

    }

    public class UploadUrls
    {
        public string? Name { get; set; }
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }

    }
}
