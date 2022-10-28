using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class CourseDiscipline
    {
        public Guid Id { get; set; }
        public Guid? CourseId { get; set; }
        public Course Course { get; set; }
        public Guid? DisciplineId { get; set; }
        public Discipline Discipline { get; set; }
    }
}
