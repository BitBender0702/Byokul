using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class CourseStudent
    {
        public Guid Id { get; set; }
        public Guid? CourseId { get; set; }
        public Course Course { get; set; }
        public Guid? StudentId { get; set; }
        public Student Student { get; set; }
        public bool IsStudentBannedFromCourse { get; set; }
    }
}
