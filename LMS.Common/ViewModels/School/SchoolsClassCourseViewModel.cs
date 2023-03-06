using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SchoolsClassCourseViewModel
    {
        public SchoolsClassCourseViewModel()
        {
            Classes = new();
            Courses = new();
        }
        public List<ClassViewModel> Classes { get; set; }
        public List<CourseViewModel> Courses { get; set; }

    }
}
