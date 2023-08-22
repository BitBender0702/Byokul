using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Permission
{
    public class PermissionMasterViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public PermissionTypeEnum PermissionType { get; set; }
        public bool IsSelectedSchoolPermission { get; set; }
        public bool IsSelectedClassPermission { get; set; }
        public bool IsSelectedCoursePermission { get; set; }

    }
}

