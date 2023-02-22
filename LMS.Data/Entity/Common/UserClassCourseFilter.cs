using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class UserClassCourseFilter
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }
        public Guid? ClassCourseFilterId { get; set; }
        public ClassCourseFilter ClassCourseFilter { get; set; }
        public Boolean IsActive { get; set; }
        public ClassCourseFilterEnum ClassCourseFilterType { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
    }

public enum ClassCourseFilterEnum
{
    Class = 1,
    Course = 2
}


}
