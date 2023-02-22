using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Common
{
    public class UserClassCourseFilterViewModel
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public UserViewModel User { get; set; }
        public Guid? ClassCourseFilterId { get; set; }
        public ClassCourseFilterViewModel ClassCourseFilter { get; set; }
        public Boolean IsActive { get; set; }
        public ClassCourseFilterEnum ClassCourseFilterType { get; set; }
        public Guid? SchoolId { get; set; }
    }
}
