using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class School : ActionAudit
    {
        public Guid SchoolId { get; set; }
        public string SchoolName { get; set; }
        public string? Avatar { get; set; }
        public string? CoveredPhoto { get; set; }
        public string? Description { get; set; }
        public Guid? SpecializationId { get; set; }
        public Specialization Specialization { get; set; }
        public Guid? CountryId { get; set; }
        public Country Country { get; set; }
        public string SchoolUrl { get; set; }
        public bool IsVarified { get; set; }
        public int? Status { get; set; }
        public string? SchoolSlogan { get; set; }
        public DateTime? Founded { get; set; }
        public string? SchoolEmail { get; set; }
        public Guid? AccessibilityId { get; set; }
        public Accessibility Accessibility { get; set; }
        public bool IsBan { get; set; }
        public string? CountryName { get; set; }
        public bool? IsDisableByOwner { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsSchoolSubscribed { get; set; }
        public bool IsDefaultAvatar { get; set; }

    }
}
