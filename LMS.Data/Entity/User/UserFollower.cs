using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class UserFollower
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }
        public string? FollowerId { get; set; }
        public User Follower { get; set; }
        public Boolean IsBan { get; set; }
    }
}
