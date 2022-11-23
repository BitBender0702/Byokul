using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.ServiceType;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Course
{
    public class CourseDetailsViewModel
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public Guid? ServiceTypeId { get; set; }
        public ServiceTypeViewModel ServiceType { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public string? Description { get; set; }
        public long Price { get; set; }
        public Guid? AccessibilityId { get; set; }
        public string CourseUrl { get; set; }
        public AccessibilityViewModel Accessibility { get; set; }
        public IEnumerable<LanguageViewModel> Languages { get; set; }
        public IEnumerable<TeacherViewModel> Teachers { get; set; }
        public int Students { get; set; }
        public IEnumerable<DisciplineViewModel> Disciplines { get; set; }
        public IEnumerable<PostDetailsViewModel> Posts { get; set; }
    }
}
