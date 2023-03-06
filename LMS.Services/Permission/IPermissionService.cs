using LMS.Common.ViewModels.Permission;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface IPermissionService
    {
        Task<List<PermissionMasterViewModel>> GetAllPermissions();

    }
}
