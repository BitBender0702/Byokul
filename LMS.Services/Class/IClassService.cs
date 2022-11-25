using LMS.Common.ViewModels.Class;
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
        Task UpdateClass(ClassUpdateViewModel classUpdateViewModel);
        Task DeleteClassById(Guid classId, string deletedById);
        Task<ClassDetailsViewModel> GetClassById(Guid classId);
        Task<IEnumerable<ClassViewModel>> GetAllClasses();
    }
}
