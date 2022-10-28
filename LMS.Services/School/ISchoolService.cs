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
        Task SaveNewSchool(SchoolViewModel leadViewModel, string createdById);
        Task UpdateSchool(SchoolViewModel leadViewModel);
        Task<SchoolDetailsViewModel> GetSchoolById(Guid schoolId);
        Task<IEnumerable<SchoolViewModel>> GetAllSchools();
        Task DeleteSchoolById(Guid schoolId, string deletedById);
        Task<IEnumerable<CountryViewModel>> CountryList();
        Task<IEnumerable<SpecializationViewModel>> SpecializationList();
        Task<IEnumerable<LanguageViewModel>> LanguageList();
        Task<IEnumerable<SchoolFollowerViewModel>> FollowerList();
        Task SaveSchoolFollower(SchoolFollowerViewModel schoolFollowerViewModel);
        Task SaveSchoolUser(SchoolUserViewModel schoolUserViewModel);
    }
}
