using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Teacher
{
    public class TeacherViewModel
    {
        public Guid TeacherId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public string? UserId { get; set; }
        public IEnumerable<TeacherCertificateViewModel> TeacherCertificateViewModel { get; set; }
    }
}
