using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Permission
{
    public class SchoolPermissionViewModel
    {
        public Guid SchoolId { get; set; }
        public List<string> PermissionIds { get; set; }
    }
}
