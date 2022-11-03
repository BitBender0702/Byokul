using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class PostTag
    {
        public Guid Id { get; set; }
        public Guid? PostId { get; set; }
        public Post Post { get; set; }
        public string PostTagValue { get; set; }
    }
}
