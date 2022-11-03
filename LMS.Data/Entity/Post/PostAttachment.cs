using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class PostAttachment:ActionAudit
    {
        public Guid Id { get; set; }
        public Guid? PostId { get; set; }
        public Post Post { get; set; }
        public string FileName { get; set; }
    }
}
