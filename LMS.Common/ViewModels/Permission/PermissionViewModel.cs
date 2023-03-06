using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Permission
{
    public class PermissionViewModel
    {
        public List<SchoolPermissionViewModel> SchoolPermissions { get; set; }
        public List<ClassPermissionViewModel> ClassPermissions { get; set; }
        public List<CoursePermissionViewModel> CoursePermissions { get; set; }
    }
}
