using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class PermissionMaster
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public PermissionTypeEnum PermissionType { get; set; }
        public DateTime CreatedOn { get; set; }
    }

    public enum PermissionTypeEnum
    {
        School = 1,
        Class = 2,
        Course = 3
    }
}
