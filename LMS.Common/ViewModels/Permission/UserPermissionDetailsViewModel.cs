using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Permission
{
    public class UserPermissionDetailsViewModel
    {
        public List<Guid?> SchoolPermissionIds { get; set; }
        public List<Guid?> ClassPermissionIds { get; set; }
        public List<Guid?> CoursePermissionIds { get; set; }
        public List<Guid> ClassIds { get; set; }
        public List<Guid> CourseIds { get; set; }




    }
}
