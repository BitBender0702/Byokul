using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class PostTagViewModel
    {
        public Guid Id { get; set; }
        public Guid? PostId { get; set; }
        public PostViewModel Post { get; set; }
        public string PostTagValue { get; set; }
    }
}
