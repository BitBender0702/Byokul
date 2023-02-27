using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Course
{
    public class CourseInfoForCertificateViewModel
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public List<StudentViewModel> Students { get; set; }
    }
}
