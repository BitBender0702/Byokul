using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class Student : ActionAudit
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }

    }
}
