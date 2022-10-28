using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.ServiceType;
using LMS.Common.ViewModels.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Course
{
    public class CourseViewModel
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public Guid? ServiceTypeId { get; set; }
        public ServiceTypeViewModel ServiceType { get; set; }
        public string? Description { get; set; }
        public long Price { get; set; }
        public Guid? AccessibilityId { get; set; }
        public AccessibilityViewModel Accessibility { get; set; }
        public IEnumerable<string> LanguageIds { get; set; }
        public IEnumerable<string> TeacherIds { get; set; }
        public IEnumerable<string> StudentIds { get; set; }
        public IEnumerable<string> DisciplineIds { get; set; }
    }
}
