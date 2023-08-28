using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class CommentLikeUnlikeViiewModel
    {
        public string CommentId { get; set; }
        public string UserId { get; set; }
        public int? LikeCount { get; set; }
        public bool IsLike { get; set; }
        public string GroupName { get; set; }
    }
}
