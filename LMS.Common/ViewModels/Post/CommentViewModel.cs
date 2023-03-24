using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class CommentViewModel
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public UserDetailsViewModel User { get; set; }
        public string GroupName { get; set; }
        public string Content { get; set; }
        public string UserAvatar { get; set; }
        public int LikeCount { get; set; }
        public bool isCommentLikedByCurrentUser { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string? UserName { get; set; }
    }
}
