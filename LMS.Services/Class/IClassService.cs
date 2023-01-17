using LMS.Common.ViewModels.Class;
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
        Task<Guid> SaveNewClass(ClassViewModel classViewModel, string createdById);
        Task<ClassUpdateViewModel> GetClassEditDetails(Guid classId);
        Task<Guid> UpdateClass(ClassUpdateViewModel classUpdateViewModel);
        Task DeleteClassById(Guid classId, string deletedById);
        Task<ClassDetailsViewModel> GetClassById(string className,string loginUserId);
        Task<IEnumerable<ClassViewModel>> GetAllClasses();
        Task SaveClassLanguages(IEnumerable<string> languageIds, Guid classId);
        Task DeleteClassLanguage(ClassLanguageViewModel model);
        Task SaveClassTeachers(IEnumerable<string> teacherIds, Guid courseId);
        Task DeleteClassTeacher(ClassTeacherViewModel model);
        Task SaveClassCertificates(SaveClassCertificateViewModel model);
        Task DeleteClassCertificate(ClassCertificateViewModel model);
        Task<ClassViewModel> GetBasicClassInfo(Guid classId);
        Task<ClassViewModel> GetClassByName(string className, string schoolName);
        Task<bool> IsClassNameExist(string className);
        Task<bool> ConvertToCourse(string className);
        Task<List<ClassLikeViewModel>> GetLikesOnClass(Guid classId);
        Task<List<ClassViewsViewModel>> GetViewsOnClass(Guid classid);
        Task<List<ClassLikeViewModel>> LikeUnlikeClass(LikeUnlikeClassCourse model);
        Task<int> ClassView(ClassViewsViewModel model);
    }
}
