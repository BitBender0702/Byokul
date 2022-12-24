using LMS.Common.ViewModels.Admin;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Admin
{
    public interface IAdminService
    {
        Task<List<RegisteredUsersViewModel>> GetRegisteredUsers();
        Task<bool> BanUser(BanUsersViewModel model);
        Task<bool> VarifyUser(VerifyUsersViewModel model);
        Task<List<SchoolViewModel>> GetRegisteredSchools();
        Task<bool> BanSchool(BanSchoolsViewModel model);
        Task<bool> VarifySchool(VerifySchoolsViewModel model);
        Task<List<ClassViewModel>> GetRegisteredClasses();
        Task<List<CourseViewModel>> GetRegisteredCourses();
        Task<bool> DisableClass(DisableClassCourseViewModel model);
        Task<bool> DisableCourse(DisableClassCourseViewModel model);
        Task<AdminDashboardViewModel> GetDashboardDetails();
    }
}
