using LMS.Common.ViewModels.Course;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface ICourseService
    {
        Task SaveNewCourse(CourseViewModel courseViewModel, string createdById);
        Task UpdateCourse(CourseViewModel courseViewModel);
        Task DeleteCourseById(Guid classId, string deletedById);
        Task<CourseDetailsViewModel> GetCourseById(Guid courseId);
        Task<IEnumerable<CourseViewModel>> GetAllCourses();
    }
}
