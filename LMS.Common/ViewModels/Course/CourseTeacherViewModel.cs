using LMS.Common.ViewModels.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Course
{
    public class CourseTeacherViewModel
    {
        public Guid Id { get; set; }
        public Guid? CourseId { get; set; }
        public CourseViewModel Course { get; set; }
        public Guid? TeacherId { get; set; }
        public TeacherViewModel Teacher { get; set; }
    }
}
