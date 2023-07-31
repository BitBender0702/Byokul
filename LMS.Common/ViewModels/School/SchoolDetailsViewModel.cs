using LMS.Common.Enums;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.Teacher;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SchoolDetailsViewModel
    {
        public Guid SchoolId { get; set; }
        public string SchoolName { get; set; }
        public string? Avatar { get; set; }
        public string? CoveredPhoto { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedById { get; set; }
        public bool IsDeleted { get; set; }
        public Guid? SpecializationId { get; set; }
        public SpecializationViewModel Specialization { get; set; }
        public Guid? CountryId { get; set; }
        public CountryViewModel Country { get; set; }
        public string? CountryName { get; set; }
        public IEnumerable<LanguageViewModel> Languages { get; set; }
        public string SchoolUrl { get; set; }
        public bool IsVarified { get; set; }
        public StatusEnum Status { get; set; }
        public IEnumerable<CertificateViewModel> SchoolCertificates { get; set; }
        public IEnumerable<SchoolFollowerViewModel> SchoolFollowers { get; set; }
        public IEnumerable<UserViewModel> Users { get; set; }
        public int Students { get; set; }
        public IEnumerable<TeacherViewModel> Teachers { get; set; }
        public IEnumerable<ClassViewModel> Classes { get; set; }
        public IEnumerable<CourseViewModel> Courses { get; set; }
        public IEnumerable<PostDetailsViewModel> Posts { get; set; }
        public IEnumerable<PostDetailsViewModel> Reels { get; set; }
        public int NoOfAppliedClassFilters { get; set; }
        public int NoOfAppliedCourseFilters { get; set; }
        public bool? IsDisableByOwner { get; set; }
        public string? PhoneNumber { get; set; }


    }
}
