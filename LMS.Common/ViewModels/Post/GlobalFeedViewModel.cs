using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class GlobalFeedViewModel
    {
        public Guid PostId { get; set; }
        public int PostType { get; set; }
        public string ParentImageUrl { get; set; }
        public string ParentName { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<LikeViewModel> Likes { get; set; }
        public List<ViewsViewModel> Views { get; set; }
        public List<PostAttachmentViewModel> PostAttachments { get; set; }
        public bool IsPostLikedByCurrentUser { get; set; }

    }
}
