using LMS.Common.ViewModels.Common;
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
        Task<Guid> SaveNewSchool(SchoolViewModel leadViewModel, string createdById);
        Task<SchoolUpdateViewModel> GetSchoolEditDetails(Guid schoolId);
        Task<Guid> UpdateSchool(SchoolUpdateViewModel schoolUpdateViewModel);
        Task<SchoolDetailsViewModel> GetSchoolById(Guid schoolId,string loginUserId);
        Task<IEnumerable<SchoolViewModel>> GetAllSchools();
        Task DeleteSchoolById(Guid schoolId, string deletedById);
        Task<IEnumerable<SpecializationViewModel>> SpecializationList();
        Task<IEnumerable<LanguageViewModel>> LanguageList();
        //Task<IEnumerable<SchoolFollowerViewModel>> FollowerList(Guid schoolId);
        Task<bool> SaveSchoolFollower(Guid schoolId, string userId);
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

    }
}
