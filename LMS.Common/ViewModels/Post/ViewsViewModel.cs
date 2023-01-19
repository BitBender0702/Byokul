using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class ViewsViewModel
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public UserViewModel User { get; set; }
        public Guid PostId { get; set; }
        public PostViewModel Post { get; set; }
    }
}
