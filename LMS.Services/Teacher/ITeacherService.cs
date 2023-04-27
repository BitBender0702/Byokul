using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Permission;
using LMS.Common.ViewModels.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface ITeacherService
    {
        Task UpdateTeacher(TeacherViewModel teacherViewModel);
        Task<TeacherViewModel> GetTeacherById(Guid teacherId);
        Task DeleteTeacherById(Guid teacherId, string deletedById);
        Task<IEnumerable<TeacherViewModel>> GetAllTeachers();
        Task AddTeacher(AddTeacherViewModel model, string userId);
        Task<List<ClassTeacherViewModel>> GetClassTeachers(Guid classId);
        Task<List<CourseTeacherViewModel>> GetCourseTeachers(Guid classId);

    }
}
