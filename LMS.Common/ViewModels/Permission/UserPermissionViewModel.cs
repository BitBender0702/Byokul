using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Permission
{
    public class UserPermissionViewModel
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        //public UserViewModel User { get; set; }
        public Guid? PermissionId { get; set; }
        public PermissionMasterViewModel Permission { get; set; }
        public Guid TypeId { get; set; }
        public PermissionTypeEnum PermissionType { get; set; }
        public string OwnerId { get; set; }
        public Guid? SchoolId { get; set; }

    }
}
