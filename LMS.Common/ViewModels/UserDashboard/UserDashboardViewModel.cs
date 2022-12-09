using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.UserDashboard
{
    public class UserDashboardViewModel
    {
        public UserUpdateViewModel User { get; set; }
        public IEnumerable<SchoolViewModel> OwnedSchools { get; set; }
        public IEnumerable<ClassViewModel> OwnedClasses { get; set; }
        public IEnumerable<CourseViewModel> OwnedCourses { get; set; }
        public IEnumerable<SchoolViewModel> FollowedSchools { get; set; }
        public IEnumerable<ClassViewModel> FollowedClasses { get; set; }
        public IEnumerable<CourseViewModel> FollowedCourses { get; set; }
    }
}
