using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.User
{
    public class UserFollowingViewModel
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public UserDetailsViewModel User { get; set; }
        public bool IsUserFollowing { get; set; }
    }
}
