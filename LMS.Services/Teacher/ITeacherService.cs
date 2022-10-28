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
        Task SaveNewTeacher(TeacherViewModel teacherViewModel, Guid schoolId, string createdById);
        Task UpdateTeacher(TeacherViewModel teacherViewModel);
        Task<TeacherViewModel> GetTeacherById(Guid teacherId);
        Task DeleteTeacherById(Guid teacherId, string deletedById);
        Task<IEnumerable<TeacherViewModel>> GetAllTeachers();
    }
}
