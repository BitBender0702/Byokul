using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Student
{
    public class StudentViewModel
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public string? UserId { get; set; }
        public UserViewModel User { get; set; }
    }
}
