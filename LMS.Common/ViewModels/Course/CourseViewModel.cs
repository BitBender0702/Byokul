using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.ServiceType;
using LMS.Common.ViewModels.Teacher;
using Microsoft.AspNetCore.Http;
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
        public long? Price { get; set; }
        public Guid? AccessibilityId { get; set; }
        public string CourseUrl { get; set; }
        public string? Avatar { get; set; }
        public double? Rating { get; set; }
        public AccessibilityViewModel Accessibility { get; set; }
        public IEnumerable<string> LanguageIds { get; set; }
        public IEnumerable<string> TeacherIds { get; set; }
        public IEnumerable<string> StudentIds { get; set; }
        public IEnumerable<string> DisciplineIds { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedById { get; set; }
        public bool IsEnable { get; set; }
        public bool IsConvertable { get; set; }
        public IFormFile AvatarImage { get; set; }
        public bool IsPinned { get; set; }
        public IFormFile Thumbnail { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int? ThumbnailType { get; set; }
        public IEnumerable<string> CourseTags { get; set; }
        public List<CourseLikeViewModel> CourseLike { get; set; }
        public List<CourseViewsViewModel> CourseViews { get; set; }
        public int CommentsCount { get; set; }
        public bool IsCourseLikedByCurrentUser { get; set; }

    }
}
