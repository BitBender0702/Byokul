using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class SchoolTeacher
    {
        public Guid Id { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
        public Guid? TeacherId { get; set; }
        public Teacher Teacher { get; set; }
    }
}
