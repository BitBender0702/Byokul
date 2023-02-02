using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.School;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface ICourseService
    {
        Task<CourseViewModel> SaveNewCourse(CourseViewModel courseViewModel, string createdById);
        Task<CourseViewModel> UpdateCourse(CourseViewModel courseViewModel);
        Task DeleteCourseById(Guid classId, string deletedById);
        Task<CourseDetailsViewModel> GetCourseById(string courseName,string loginUserid);
        Task<IEnumerable<CourseViewModel>> GetAllCourses();
        Task<CourseViewModel> GetBasicCourseInfo(Guid courseId);
        Task SaveCourseLanguages(IEnumerable<string> languageIds, Guid courseId);
        Task DeleteCourseLanguage(CourseLanguageViewModel model);
        Task SaveCourseTeachers(IEnumerable<string> teacherIds, Guid courseId);
        Task DeleteCourseTeacher(CourseTeacherViewModel model);
        Task SaveCourseCertificates(SaveCourseCertificateViewModel model);
        Task DeleteCourseCertificate(CourseCertificateViewModel model);
        Task<bool> ConvertToClass(string courseName);
        Task<CourseViewModel> GetCourseByName(string courseName, string schoolName);
        Task<bool> IsCourseNameExist(string className);
        Task<List<CourseLikeViewModel>> GetLikesOnCourse(Guid courseId);
        Task<List<CourseViewsViewModel>> GetViewsOnCourse(Guid courseId);
        Task<List<CourseLikeViewModel>> LikeUnlikeCourse(LikeUnlikeClassCourse model);
        Task<int> CourseView(CourseViewsViewModel model);
        


    }
}
