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
        Task SaveNewSchool(SchoolViewModel leadViewModel, string createdById);
        Task UpdateSchool(SchoolUpdateViewModel schoolUpdateViewModel);
        Task<SchoolDetailsViewModel> GetSchoolById(Guid schoolId,string loginUserId);
        Task<IEnumerable<SchoolViewModel>> GetAllSchools();
        Task DeleteSchoolById(Guid schoolId, string deletedById);
        Task<IEnumerable<SpecializationViewModel>> SpecializationList();
        Task<IEnumerable<LanguageViewModel>> LanguageList();
        //Task<IEnumerable<SchoolFollowerViewModel>> FollowerList(Guid schoolId);
        Task SaveSchoolFollower(Guid schoolId, string userId);
        Task SaveSchoolUser(SchoolUserViewModel schoolUserViewModel);
        Task SaveSchoolCertificates(SchoolCertificateViewModel schoolCertificateViewModel);
        
    }
}
