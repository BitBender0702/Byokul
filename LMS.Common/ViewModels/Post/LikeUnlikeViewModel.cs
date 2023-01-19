using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class LikeUnlikeViewModel
    {
        public Boolean IsLike { get; set; }
        public Guid CommentId { get; set; }
        public string? UserId { get; set; }
        public Guid? PostId { get; set; }
    }
}
