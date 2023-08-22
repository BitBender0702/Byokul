using LMS.Common.ViewModels.Permission;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Teacher
{
    public class AddTeacherViewModel
    {
        public string UserId { get; set; }
        public Guid SchoolId { get; set; }
        //public string FirstName { get; set; }
        //public string LastName { get; set; }
        //public string Email { get; set; }
        //public int Gender { get; set; }
        public PermissionViewModel Permissions { get; set; }
        public Boolean IsAllSchoolSelected { get; set; }
        public Boolean IsAllClassSelected { get; set; }
        public Boolean IsAllCourseSelected { get; set; }
        public string OwnerId { get; set; }

    }
}
