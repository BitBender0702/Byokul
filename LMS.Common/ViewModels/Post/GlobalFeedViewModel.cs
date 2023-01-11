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
        public string Title { get; set; }
        public string Description { get; set; }
        public int LikeCount { get; set; }
        public int ViewCount { get; set; }
        public List<PostAttachmentViewModel> PostAttachments { get; set; }
    }
}
