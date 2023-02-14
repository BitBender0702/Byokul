using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class CommentLike
    {
        public Guid Id { get; set; }
        public Guid? CommentId { get; set; }
        public Comment Comment { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }

    }
}
