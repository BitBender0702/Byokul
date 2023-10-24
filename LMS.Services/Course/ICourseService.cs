using LMS.Common.Enums;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
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
        Task RestoreCourseById(Guid classId, string deletedById);
        Task<CourseDetailsViewModel> GetCourseByName(string courseName,string loginUserid);
        Task<CourseDetailsViewModel> GetCourseById(Guid courseId, string loginUserid);
        Task<IEnumerable<CourseViewModel>> GetAllCourses();
        Task<CourseViewModel> GetBasicCourseInfo(Guid courseId);
        Task SaveCourseLanguages(IEnumerable<string> languageIds, Guid courseId);
        Task DeleteCourseLanguage(CourseLanguageViewModel model);
        Task SaveCourseTeachers(IEnumerable<string> teacherIds, Guid courseId);
        Task<bool> DeleteCourseTeacher(CourseTeacherViewModel model);
        Task SaveCourseCertificates(SaveCourseCertificateViewModel model);
        Task DeleteCourseCertificate(CourseCertificateViewModel model);
        Task<ClassViewModel> ConvertToClass(Guid courseId);
        //Task<CourseViewModel> GetCourseByName(string courseName, string schoolName);
        Task<bool> IsCourseNameExist(string className);
        Task<List<CourseLikeViewModel>> GetLikesOnCourse(Guid courseId);
        Task<List<CourseViewsViewModel>> GetViewsOnCourse(Guid courseId);
        Task<List<CourseLikeViewModel>> LikeUnlikeCourse(LikeUnlikeClassCourse model);
        Task<int> CourseView(CourseViewsViewModel model);
        Task<IEnumerable<PostDetailsViewModel>> GetPostsByCourseId(Guid classId, string loginUserId, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetReelsByCourseId(Guid classId, string loginUserId, int pageNumber, int pageSize);
        Task<List<ClassCourseFilterViewModel>> GetCourseFilters(string userId, Guid schoolId);
        Task SaveCourseFilters(List<UserClassCourseFilterViewModel> model, string userId);
        Task<int> GetStudents(Guid courseId);
        Task<CourseInfoForCertificateViewModel> GetCourseInfoForCertificate(Guid courseId);
        Task EnableDisableCourse(Guid courseId);
        Task<IEnumerable<PostDetailsViewModel>> GetSliderReelsByCourseId(Guid courseId, string loginUserId, Guid lastReelId, ScrollTypesEnum scrollType);
        Task EnableDisableComments(Guid courseId, bool isHideComments);
        Task<int?> CourseRating(ClassCourseRatingViewModel courseRating);

        Task<bool?> BanUnbanStudentFromCourse(BanUnbanStudentModel banUnbanStudent);


    }
}
