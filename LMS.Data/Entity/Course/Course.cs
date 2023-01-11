using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class Course : ActionAudit
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
        public Guid? ServiceTypeId { get; set; }
        public ServiceType ServiceType { get; set; }
        public string? Description { get; set; }
        public Guid? AccessibilityId { get; set; }
        public Accessibility Accessibility { get; set; }
        public long Price { get; set; }
        public string CourseUrl { get; set; }
        public bool IsEnable { get; set; }
        public string? Avatar { get; set; }
        public double? Rating { get; set; }
        public bool IsPinned { get; set; }
        public string? ThumbnailUrl { get; set; }
    }
}
