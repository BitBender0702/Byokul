using LMS.Common.Enums;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface ISchoolService
    {
        Task<SchoolViewModel> SaveNewSchool(SchoolViewModel leadViewModel, string createdById);
        Task<SchoolUpdateViewModel> GetSchoolEditDetails(Guid schoolId);
        Task<SchoolUpdateViewModel> UpdateSchool(SchoolUpdateViewModel schoolUpdateViewModel);
        Task<SchoolDetailsViewModel> GetSchoolByName(string schoolName,string loginUserId);
        Task<SchoolDetailsViewModel> GetSchoolById(Guid schoolId, string loginUserId);
        Task<IEnumerable<SchoolViewModel>> GetAllSchools(string userId);
        Task DeleteSchoolById(Guid schoolId, string deletedById);
        Task<IEnumerable<SpecializationViewModel>> SpecializationList();
        Task<IEnumerable<LanguageViewModel>> LanguageList();
        //Task<IEnumerable<SchoolFollowerViewModel>> FollowerList(Guid schoolId);
        Task<bool> FollowUnFollowSchool(FollowUnFollowViewModel model, string userId);
        Task SaveSchoolUser(SchoolUserViewModel schoolUserViewModel);
        Task SaveSchoolCertificates(SaveSchoolCertificateViewModel model);
        Task DeleteSchoolCertificate(SchoolCertificateViewModel model);
        Task SaveSchoolDefaultLogo(string logoUrl);
        Task<IEnumerable<SchoolDefaultLogoViewmodel>> GetSchoolDefaultLogos();
        Task SaveSchoolLanguages(IEnumerable<string> languageIds, Guid schoolId);
        Task DeleteSchoolLanguage(SchoolLanguageViewModel model);
        Task SaveSchoolTeachers(SaveSchoolTeacherViewModel model);
        Task DeleteSchoolTeacher(SchoolTeacherViewModel model);
        Task<SchoolViewModel> GetBasicSchoolInfo(Guid schoolId);
        Task<List<SchoolFollowerViewModel>> GetSchoolFollowers(Guid schoolId, int pageNumber, string? searchString);
        Task<bool> IsSchoolNameExist(string schoolName);
        //Task<SchoolViewModel> GetSchoolByName(string schoolName);
        Task<IEnumerable<CombineClassCourseViewModel>> GetSchoolClassCourse(Guid? schoolId, string userId, int pageNumber);
        Task<bool> PinUnpinClassCourse(Guid id, ClassCourseEnum type, bool isPinned);
        Task<List<SchoolViewModel>> GetUserAllSchools(string userId);
        Task<IEnumerable<PostDetailsViewModel>> GetPostsBySchool(Guid schoolId, string loginUserId, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetReelsBySchool(Guid schoolId, string loginUserId, int pageNumber, int pageSize);
        Task<SchoolsClassCourseViewModel> GetSchoolsClassCourse(IEnumerable<string> schoolIds);
        Task SaveClassCourse(string userId, Guid id, ClassCourseEnum type);
        Task<IEnumerable<CombineClassCourseViewModel>> GetSavedClassCourse(string userId, int pageNumber);
        Task<bool> PinUnpinSavedClassCourse(Guid id, bool isPinned,ClassCourseEnum type, string userId);
        Task<IEnumerable<StudentViewModel>> GetClassStudentsBySchoolId(Guid schoolId);
        Task<IEnumerable<StudentViewModel>> GetCourseStudentsBySchoolId(Guid schoolId);
        Task EnableDisableSchool(Guid schoolId);
        Task<bool> BanFollower(string followerId,Guid schoolId);
        Task<IEnumerable<GlobalSearchViewModel>> SchoolsGlobalSearch(string searchString, int pageNumber, int pageSize);


    }
}
