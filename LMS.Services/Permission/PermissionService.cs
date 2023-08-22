using AutoMapper;
using LMS.Common.ViewModels.Permission;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using MimeKit.Encodings;
using Org.BouncyCastle.Math.EC.Rfc7748;
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
        private readonly IGenericRepository<UserPermission> _userPermissionRepository;
        private readonly IGenericRepository<Class> _classRepository;
        private readonly IGenericRepository<Course> _courseRepository;
        public PermissionService(IMapper mapper, IGenericRepository<PermissionMaster> permissionMasterRepository, IGenericRepository<UserPermission> userPermissionRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository)
        {
            _mapper = mapper;
            _permissionMasterRepository = permissionMasterRepository;
            _userPermissionRepository = userPermissionRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
        }

        public async Task<List<PermissionMasterViewModel>> GetAllPermissions()
        {
            var permissions = await _permissionMasterRepository.GetAll().OrderBy(x => x.CreatedOn).ToListAsync();
            return _mapper.Map<List<PermissionMasterViewModel>>(permissions);
        }

        //public async Task<List<UserPermissionViewModel>> GetTeacherPermissions(string userId)
        //{
        //    var permissionViewModel = new PermissionViewModel();

        //    var userpermissions = await _userPermissionRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();
        //    var response = _mapper.Map<List<UserPermissionViewModel>>(userpermissions);


        //    var model = new SchoolPermissionViewModel();
        //    var classModel = new ClassPermissionViewModel();
        //    var schoolPermissionList = new List<string>();
        //    var classPermissionList = new List<string>();
        //    foreach (var item in response)
        //    {

        //        if (item.PermissionType == PermissionTypeEnum.School)
        //        {
        //            schoolPermissionList.Add(item.PermissionId.ToString());
        //            model.SchoolId = item.TypeId;
        //        }

        //        if (item.PermissionType == PermissionTypeEnum.Class)
        //        {
        //            classPermissionList.Add(item.PermissionId.ToString());
        //            classModel.ClassId = item.TypeId;
        //            classModel.SchoolId = item.SchoolId;

        //        }
        //    }
        //    model.PermissionIds = schoolPermissionList;
        //    classModel.PermissionIds = classPermissionList;
        //    permissionViewModel.ClassPermissions.Add(classModel);
        //    permissionViewModel.SchoolPermissions.Add(model);




        //    return response;
        //}

        public async Task<UserPermissionDetailsViewModel> GetTeacherPermissions(string userId, Guid schoolId)
        {
            try
            {
                var model = new UserPermissionDetailsViewModel();
                var schoolPermissionIds = await _userPermissionRepository.GetAll().Where(x => x.SchoolId == schoolId && x.PermissionType == PermissionTypeEnum.School).Select(x => x.PermissionId).ToListAsync();
                schoolPermissionIds = schoolPermissionIds.DistinctBy(x => x.Value).ToList();

                var classPermissionIds = await _userPermissionRepository.GetAll().Where(x => x.SchoolId == schoolId && x.PermissionType == PermissionTypeEnum.Class).Select(x => x.PermissionId).ToListAsync();
                classPermissionIds = classPermissionIds.DistinctBy(x => x.Value).ToList();

                var coursePermissionIds = await _userPermissionRepository.GetAll().Where(x => x.SchoolId == schoolId && x.PermissionType == PermissionTypeEnum.Course).Select(x => x.PermissionId).ToListAsync();
                coursePermissionIds = coursePermissionIds.DistinctBy(x => x.Value).ToList();

                var classIds = await _userPermissionRepository.GetAll().Where(x => x.SchoolId == schoolId && x.PermissionType == PermissionTypeEnum.Class).Select(x => x.TypeId).ToListAsync();
                if (classIds.Count() > 0 && classIds[0] == new Guid())
                {
                    var classIdList = await _classRepository.GetAll().Where(x => x.SchoolId == schoolId).Select(x => x.ClassId).ToListAsync();
                    classIds.RemoveAt(0);
                    classIds.AddRange(classIdList);
                }
                classIds = classIds.DistinctBy(x => x).ToList();

                var courseIds = await _userPermissionRepository.GetAll().Where(x => x.SchoolId == schoolId && x.PermissionType == PermissionTypeEnum.Course).Select(x => x.TypeId).ToListAsync();

                if (courseIds.Count() > 0 && courseIds[0] == new Guid())
                {
                    var courseIdList = await _courseRepository.GetAll().Where(x => x.SchoolId == schoolId).Select(x => x.CourseId).ToListAsync();
                    courseIds.RemoveAt(0);
                    courseIds.AddRange(courseIdList);
                }
                courseIds = courseIds.DistinctBy(x => x).ToList();
                model.SchoolPermissionIds = schoolPermissionIds;
                model.ClassPermissionIds = classPermissionIds;
                model.CoursePermissionIds = coursePermissionIds;
                model.ClassIds = classIds;
                model.CourseIds = courseIds;

                return model;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }



}
