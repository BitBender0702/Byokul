using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class SchoolFollower
    {
        public Guid Id { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }
    }
}
