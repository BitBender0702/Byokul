using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.ServiceType;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class ClassUpdateViewModel
    {
        public Guid ClassId { get; set; }
        public string ClassName { get; set; }
        public string? Avatar { get; set; }
        public IFormFile AvatarImage { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public int NoOfStudents { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid? ServiceTypeId { get; set; }
        public ServiceTypeViewModel ServiceType { get; set; }
        public Guid? AccessibilityId { get; set; }
        public AccessibilityViewModel Accessibility { get; set; }
        public long? Price { get; set; }
        public string? Description { get; set; }
        public IEnumerable<LanguageViewModel> Languages { get; set; }
        public IEnumerable<string> LanguageIds { get; set; }
    }
}
