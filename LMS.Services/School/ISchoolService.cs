using LMS.Common.Enums;
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
    public interface ISchoolService
    {
        Task<SchoolViewModel> SaveNewSchool(SchoolViewModel leadViewModel, string createdById);
        Task<SchoolUpdateViewModel> GetSchoolEditDetails(Guid schoolId);
        Task<SchoolUpdateViewModel> UpdateSchool(SchoolUpdateViewModel schoolUpdateViewModel);
        Task<SchoolDetailsViewModel> GetSchoolById(string schoolName,string loginUserId);
        Task<IEnumerable<SchoolViewModel>> GetAllSchools();
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
        Task<List<SchoolFollowerViewModel>> GetSchoolFollowers(Guid schoolId);
        Task<bool> IsSchoolNameExist(string schoolName);
        Task<SchoolViewModel> GetSchoolByName(string schoolName);
        Task<IEnumerable<CombineClassCourseViewModel>> GetSchoolClassCourse(Guid? schoolId,string userId, int pageNumber);
        Task<bool> PinUnpinClassCourse(Guid id, ClassCourseEnum type, bool isPinned);
        Task<List<SchoolViewModel>> GetUserAllSchools(string userId);
        Task<IEnumerable<PostDetailsViewModel>> GetPostsBySchool(Guid schoolId, string loginUserId, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetReelsBySchool(Guid schoolId, string loginUserId, int pageNumber, int pageSize);


    }
}
