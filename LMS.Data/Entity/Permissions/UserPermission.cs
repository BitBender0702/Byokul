using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class UserPermission
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }
        public Guid? PermissionId { get; set; }
        public PermissionMaster Permission { get; set; }
        public Guid TypeId { get; set; }
        public PermissionTypeEnum PermissionType { get; set; }
        public string OwnerId { get; set; }
        public Guid? SchoolId { get; set; }
    }

}
