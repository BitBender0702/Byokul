using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.User
{
    public class UserFollowerViewModel
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public UserViewModel User { get; set; }
        public string? FollowerId { get; set; }
        public UserViewModel Follower { get; set; }
    }
}
