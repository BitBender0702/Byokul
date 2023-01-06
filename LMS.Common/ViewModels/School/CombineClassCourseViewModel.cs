using LMS.Common.Enums;
using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.ServiceType;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class CombineClassCourseViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? ServiceTypeId { get; set; }
        public ServiceTypeViewModel ServiceType { get; set; }
        public Guid? AccessibilityId { get; set; }
        public AccessibilityViewModel Accessibility { get; set; }
        public string? Avatar { get; set; }
        public double? Rating { get; set; }
        public long? Price { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public ClassCourseEnum Type { get; set; }
        public bool IsPinned { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? ThumbnailUrl { get; set; }

    }

}
