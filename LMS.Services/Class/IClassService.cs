using LMS.Common.Enums;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface IClassService
    {
        Task<ClassViewModel> SaveNewClass(ClassViewModel classViewModel, string createdById);
        Task<ClassUpdateViewModel> GetClassEditDetails(Guid classId);
        Task<ClassUpdateViewModel> UpdateClass(ClassUpdateViewModel classUpdateViewModel);
        Task DeleteClassById(Guid classId, string deletedById);
        Task<ClassDetailsViewModel> GetClassByName(string className, string loginUserId);
        Task<ClassDetailsViewModel> GetClassById(Guid classId, string loginUserId);
        Task<IEnumerable<ClassViewModel>> GetAllClasses();
        Task SaveClassLanguages(IEnumerable<string> languageIds, Guid classId);
        Task DeleteClassLanguage(ClassLanguageViewModel model);
        Task SaveClassTeachers(IEnumerable<string> teacherIds, Guid courseId);
        Task<bool> DeleteClassTeacher(ClassTeacherViewModel model);
        Task SaveClassCertificates(SaveClassCertificateViewModel model);
        Task DeleteClassCertificate(ClassCertificateViewModel model);
        Task<ClassViewModel> GetBasicClassInfo(Guid classId);
        //Task<ClassViewModel> GetClassByName(string className, string schoolName);
        Task<bool> IsClassNameExist(string className);
        Task<ClassViewModel> ConvertToCourse(string className);
        Task<List<ClassLikeViewModel>> GetLikesOnClass(Guid classId);
        Task<List<ClassViewsViewModel>> GetViewsOnClass(Guid classid);
        Task<List<ClassLikeViewModel>> LikeUnlikeClass(LikeUnlikeClassCourse model);
        Task<int> ClassView(ClassViewsViewModel model);
        Task<IEnumerable<PostDetailsViewModel>> GetPostsByClassId(Guid classId, string loginUserId, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetReelsByClassId(Guid classId, string loginUserId, int pageNumber, int pageSize);
        Task<List<ClassCourseFilterViewModel>> GetClassFilters(string userId,Guid schoolId);
        Task SaveClassFilters(List<UserClassCourseFilterViewModel> model, string userId);
        Task<int> GetStudents(Guid classId);
        Task<ClassInfoForCertificateViewModel> GetClassInfoForCertificate(Guid classId);
        Task EnableDisableClass(Guid classId);
        Task<IEnumerable<GlobalSearchViewModel>> ClassAndCoursesGlobalSearch(string searchString, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetSliderReelsByClassId(Guid classId, string loginUserId, Guid lastReelId, ScrollTypesEnum scrollType);

        Task EnableDisableComments(Guid classId, bool isHideComments);

        Task<int?> ClassRating(ClassCourseRatingViewModel classRating);


    }
}
