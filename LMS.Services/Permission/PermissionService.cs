using AutoMapper;
using LMS.Common.ViewModels.Permission;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IMapper _mapper;

        private readonly IGenericRepository<PermissionMaster> _permissionMasterRepository;
        public PermissionService(IMapper mapper, IGenericRepository<PermissionMaster> permissionMasterRepository)
        {
            _mapper = mapper;
            _permissionMasterRepository = permissionMasterRepository;
        }

        public async Task<List<PermissionMasterViewModel>> GetAllPermissions()
        {
            var permissions = await _permissionMasterRepository.GetAll().OrderBy(x => x.CreatedOn).ToListAsync();
            return _mapper.Map<List<PermissionMasterViewModel>>(permissions);
        }
    }
}
