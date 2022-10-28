using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class CourseTeacher
    {
        public Guid Id { get; set; }
        public Guid? CourseId { get; set; }
        public Course Course { get; set; }
        public Guid? TeacherId { get; set; }
        public Teacher Teacher { get; set; }
    }
}
