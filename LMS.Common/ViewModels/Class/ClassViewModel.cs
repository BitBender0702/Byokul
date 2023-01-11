using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.ServiceType;
using LMS.Common.ViewModels.Teacher;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class ClassViewModel
    {
        public Guid ClassId { get; set; }
        public string ClassName { get; set; }
        public int NoOfStudents { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public Guid? ServiceTypeId { get; set; }
        public ServiceTypeViewModel ServiceType { get; set; }
        public Guid? AccessibilityId { get; set; }
        public AccessibilityViewModel Accessibility { get; set; }
        public string? Description { get; set; }
        public long? Price { get; set; }
        public double? Rating { get; set; }
        public string? ThumbnailUrl { get; set; }
        public IFormFile Thumbnail { get; set; }
        public string ClassUrl { get; set; }
        public string? Avatar { get; set; }
        public IEnumerable<string> LanguageIds { get; set; }
        public IEnumerable<string> TeacherIds { get; set; }
        public IEnumerable<string> StudentIds { get; set; }
        public IEnumerable<string> DisciplineIds { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public bool IsEnable { get; set; }
        public bool IsPinned { get; set; }
        public IEnumerable<string> ClassTags { get; set; }


    }
}
