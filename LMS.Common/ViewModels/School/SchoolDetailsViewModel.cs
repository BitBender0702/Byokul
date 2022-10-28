using LMS.Common.Enums;
using LMS.Common.ViewModels.Teacher;
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
        public bool IsDeleted { get; set; }
        public Guid? SpecializationId { get; set; }
        public SpecializationViewModel Specialization { get; set; }
        public Guid? CountryId { get; set; }
        public CountryViewModel Country { get; set; }
        public IEnumerable<LanguageViewModel> Languages { get; set; }
        public string SchoolUrl { get; set; }
        public bool IsVarified { get; set; }
        public StatusEnum Status { get; set; }
    }
}
