using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class GlobalFeedViewModel
    {
        public Guid Id { get; set; }
        public int PostType { get; set; }
        public string ParentImageUrl { get; set; }
        public string ParentName { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DateTime { get; set; }
        public IEnumerable<PostTagViewModel> PostTags { get; set; }
        public List<LikeViewModel> Likes { get; set; }
        public List<ViewsViewModel> Views { get; set; }
        public int CommentsCount { get; set; }
        public List<PostAttachmentViewModel> PostAttachments { get; set; }
        public bool IsPostLikedByCurrentUser { get; set; }
        public int PostAuthorType { get; set; }
        public string SchoolName { get; set; }
        public string ParentId { get; set; }
        public string CreatedBy { get; set; }
        public Boolean IsCommentsDisabled { get; set; }
        public int PostSharedCount { get; set; }
        public bool IsPostSavedByCurrentUser { get; set; }
        public int SavedPostsCount { get; set; }

    }
}
