using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Iyizico;
using LMS.Common.ViewModels.Teacher;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SchoolViewModel
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
        public Guid? AccessibilityId { get; set; }
        public SpecializationViewModel Specialization { get; set; }
        public Guid? CountryId { get; set; }
        public CountryViewModel Country { get; set; }
        public string CountryName { get; set; }
        public IEnumerable<SchoolCertificateViewModel> SchoolCertificates { get; set; }
        public IEnumerable<SchoolTagViewModel> SchoolTags { get; set; }
        public IFormFile AvatarImage { get; set; }
        public IEnumerable<string> LanguageIds { get; set; }
        public string SchoolUrl { get; set; }
        public bool IsVarified { get; set; }
        public bool IsBan { get; set; }
        public int? Status { get; set; }
        public DateTime? Founded { get; set; }
        public bool IsDisableByOwner { get; set; }
        public Guid? ClassStudentId { get; set; }
        public Guid? CourseStudentId { get; set; }
        public string? PhoneNumber { get; set; }
        public BuySchoolSubscriptionViewModel SubscriptionDetails { get; set; }
        public string SubscriptionDetailsJson { get; set; }
        public string SubscriptionMessage { get; set; }
        public bool IsSchoolSubscribed { get; set; }
        public bool IsDefaultAvatar { get; set; }
        public string SchoolSlogan { get; set; }
        public string SchoolEmail { get; set; }
        public double? AvailableStorageSpace { get; set; }



    }
}
