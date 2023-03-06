using AutoMapper;
using LMS.Common.ViewModels.Permission;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using LMS.Services.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<Teacher> _teacherRepository;
        private IGenericRepository<SchoolTeacher> _schoolTeacherRepository;
        private IGenericRepository<TeacherCertificate> _teacherCertificateRepository;
        private readonly UserManager<User> _userManager;
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<ClassTeacher> _classTeacherRepository;
        private IGenericRepository<CourseTeacher> _courseTeacherRepository;
        private IGenericRepository<UserPermission> _userPermissionRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ICommonService _commonService;
        private IConfiguration _config;

        public TeacherService(IMapper mapper, IGenericRepository<Teacher> teacherRepository, IGenericRepository<SchoolTeacher> schoolTeacherRepository, IGenericRepository<TeacherCertificate> teacherCertificateRepository, UserManager<User> userManager, IGenericRepository<User> userRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<CourseTeacher> courseTeacherRepository, IGenericRepository<UserPermission> userPermissionRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IWebHostEnvironment webHostEnvironment, ICommonService commonService, IConfiguration config)
        {
            _mapper = mapper;
            _teacherRepository = teacherRepository;
            _schoolTeacherRepository = schoolTeacherRepository;
            _teacherCertificateRepository = teacherCertificateRepository;
            _userManager = userManager;
            _userRepository = userRepository;
            _classTeacherRepository = classTeacherRepository;
            _courseTeacherRepository = courseTeacherRepository;
            _userPermissionRepository = userPermissionRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _webHostEnvironment = webHostEnvironment;
            _commonService = commonService;
            _config = config;
        }

        async Task SaveInSchoolTeachers(Guid teacherId, Guid schoolId)
        {
            var schoolTeacher = new SchoolTeacher
            {
                SchoolId = schoolId,
                TeacherId = teacherId
            };
            _schoolTeacherRepository.Insert(schoolTeacher);
            _schoolTeacherRepository.Save();
        }

        async Task SaveTeacherCertificate(IEnumerable<TeacherCertificateViewModel> teacherCertificates, Guid teacherId)
        {
            foreach (var certificate in teacherCertificates)
            {
                var teacherCertificate = new TeacherCertificate
                {
                    CertificateUrl = certificate.CertificateUrl,
                    TeacherId = teacherId
                };
                _teacherCertificateRepository.Insert(teacherCertificate);
                _schoolTeacherRepository.Save();
            }
        }

        public async Task UpdateTeacher(TeacherViewModel teacherViewModel)
        {
            Teacher teacher = _teacherRepository.GetById(teacherViewModel.TeacherId);
            teacher.FirstName = teacherViewModel.FirstName;
            teacher.LastName = teacherViewModel.LastName;
            teacher.Description = teacherViewModel.Description;
            teacher.IsActive = teacherViewModel.IsActive;
            _teacherRepository.Update(teacher);
            _teacherRepository.Save();

            if (teacherViewModel.TeacherCertificateViewModel != null)
            {
                await UpdateTeacherCertificates(teacherViewModel.TeacherCertificateViewModel, teacher.TeacherId);
            }
        }

        async Task UpdateTeacherCertificates(IEnumerable<TeacherCertificateViewModel> teacherCertificateViewModel, Guid teacherId)
        {
            var teacherCertificate = _teacherCertificateRepository.GetAll().Where(x => x.TeacherId == teacherId).ToList();
            if (teacherCertificate.Any())
            {
                _teacherCertificateRepository.DeleteAll(teacherCertificate);
            }

            await SaveTeacherCertificate(teacherCertificateViewModel, teacherId);

        }

        public async Task<TeacherViewModel> GetTeacherById(Guid teacherId)
        {
            TeacherViewModel model = new TeacherViewModel();
            Teacher teacher = _teacherRepository.GetById(teacherId);
            model.TeacherId = teacherId;
            model.FirstName = teacher.FirstName;
            model.LastName = teacher.LastName;
            model.CreatedBy = teacher.CreatedById;
            model.Description = teacher.Description;
            model.IsActive = teacher.IsActive;
            var response = await GetCertificateByTeacherId(teacherId);
            model.TeacherCertificateViewModel = response;
            return model;
        }
        async Task<IEnumerable<TeacherCertificateViewModel>> GetCertificateByTeacherId(Guid teacherId)
        {
            var teacherCertificate = _teacherCertificateRepository.GetAll().Where(x => x.TeacherId == teacherId);
            var response = _mapper.Map<IEnumerable<TeacherCertificateViewModel>>(teacherCertificate);
            return response;
        }

        public async Task DeleteTeacherById(Guid teacherId, string deletedByid)
        {
            Teacher teacher = _teacherRepository.GetById(teacherId);
            teacher.IsDeleted = true;
            teacher.DeletedById = deletedByid;
            teacher.DeletedOn = DateTime.UtcNow;
            _teacherRepository.Update(teacher);
            _teacherRepository.Save();
        }

        public async Task<IEnumerable<TeacherViewModel>> GetAllTeachers()
        {
            IEnumerable<TeacherViewModel> model = _teacherRepository.GetAll().Where(x => !x.IsDeleted).Select(x => new TeacherViewModel
            {
                TeacherId = x.TeacherId,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedBy = x.CreatedById,
            });

            var response = await GetAllCertificates(model.ToList());
            return response;
        }

        public async Task<IEnumerable<TeacherViewModel>> GetAllCertificates(IEnumerable<TeacherViewModel> model)
        {
            foreach (var item in model)
            {
                var teacherCertificate = await GetCertificateByTeacherId(item.TeacherId);
                item.TeacherCertificateViewModel = teacherCertificate;
            }
            return model;
        }

        public async Task AddTeacher(AddTeacherViewModel model)
        {
            var ownerInfo = _userRepository.GetById(model.OwnerId);
            var ownerName = ownerInfo.FirstName + " " + ownerInfo.LastName;
            string userId = "";
            var isEmailExist = await _userRepository.GetAll().Where(x => x.Email == model.Email).FirstOrDefaultAsync();
            if (isEmailExist == null)
            {
                var user = new User
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    Gender = model.Gender,
                    CreatedOn = DateTime.UtcNow
                };
                var result = await _userManager.CreateAsync(user);
                userId = user.Id;
                await InviteUser(user, ownerName);
            }
            else
            {
                await SendPermissionsEmailToUser(isEmailExist, ownerName);
                userId = isEmailExist.Id;
            }
            await SaveNewTeacher(model, userId);
            await SaveTeacherPermissions(model, userId);
        }

        public async Task InviteUser(User user, string OwnerName)
        {
            var path = _webHostEnvironment.ContentRootPath;
            var filePath = Path.Combine(path, "Email/invite-user.html");
            var text = System.IO.File.ReadAllText(filePath);
            text = text.Replace("[Recipient]", user.FirstName + " " + user.LastName);
            text = text.Replace("[OwnerName]", OwnerName);

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            string callBackUrl = $"{_config["AppUrl"]}/user/auth/setPassword?email={user.Email}";
            text = text.Replace("[URL]", callBackUrl);
            _commonService.SendEmail(new List<string> { user.Email }, null, null, "Invitation Link", body: text, null, null);
        }

        public async Task SendPermissionsEmailToUser(User user, string OwnerName)
        {
            var path = _webHostEnvironment.ContentRootPath;
            var filePath = Path.Combine(path, "Email/user-permissions.html");
            var text = File.ReadAllText(filePath);
            text = text.Replace("[Recipient]", user.FirstName + " " + user.LastName);
            text = text.Replace("[OwnerName]", OwnerName);

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            _commonService.SendEmail(new List<string> { user.Email }, null, null, "Assigned Permissions", body: text, null, null);
        }

        public async Task SaveNewTeacher(AddTeacherViewModel model, string userId)
        {
            Guid teacherId = new Guid();
            var isTeacherExist = await _teacherRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();
            if (isTeacherExist == null)
            {
                var teacher = new Teacher
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    IsActive = false,
                    UserId = userId
                };

                _teacherRepository.Insert(teacher);
                _teacherRepository.Save();

                teacherId = teacher.TeacherId;
            }
            else
            {
                teacherId = isTeacherExist.TeacherId;
            }


            await SaveTeacherForSchools(model, teacherId);
            await SaveTeacherForClasses(model, teacherId);
            await SaveTeacherForCourses(model, teacherId);
        }

        public async Task SaveTeacherForSchools(AddTeacherViewModel model, Guid teacherId)
        {
            var schoolTeachers = await _schoolTeacherRepository.GetAll().ToListAsync();

            foreach (var item in model.Permissions.SchoolPermissions)
            {
                var isTeacherExist = schoolTeachers.Where(x => x.TeacherId == teacherId && x.SchoolId == item.SchoolId).FirstOrDefault();
                if (isTeacherExist == null)
                {
                    var schoolTeacher = new SchoolTeacher
                    {
                        TeacherId = teacherId,
                        SchoolId = item.SchoolId
                    };
                    _schoolTeacherRepository.Insert(schoolTeacher);
                    _schoolTeacherRepository.Save();
                }

            }
        }

        public async Task SaveTeacherForClasses(AddTeacherViewModel model, Guid teacherId)
        {
            var classTeachers = await _classTeacherRepository.GetAll().ToListAsync();
            foreach (var item in model.Permissions.SchoolPermissions)
            {
                var classIds = await _classRepository.GetAll().Where(x => x.SchoolId == item.SchoolId).Select(x => x.ClassId).ToListAsync();

                foreach (var classId in classIds)
                {
                    var isTeacherExist = classTeachers.Where(x => x.TeacherId == teacherId && x.ClassId == classId).FirstOrDefault();
                    if (isTeacherExist == null)
                    {
                        var classTeacher = new ClassTeacher
                        {
                            TeacherId = teacherId,
                            ClassId = classId
                        };

                        _classTeacherRepository.Insert(classTeacher);
                        _classTeacherRepository.Save();
                    }
                }

            }
        }

        public async Task SaveTeacherForCourses(AddTeacherViewModel model, Guid teacherId)
        {
            var courseTeachers = await _courseTeacherRepository.GetAll().ToListAsync();
            foreach (var item in model.Permissions.SchoolPermissions)
            {
                var courseIds = await _courseRepository.GetAll().Where(x => x.SchoolId == item.SchoolId).Select(x => x.CourseId).ToListAsync();
                foreach (var courseId in courseIds)
                {
                    var isTeacherExist = courseTeachers.Where(x => x.TeacherId == teacherId && x.CourseId == courseId).FirstOrDefault();
                    if (isTeacherExist == null)
                    {
                        var courseTeacher = new CourseTeacher
                        {
                            TeacherId = teacherId,
                            CourseId = courseId
                        };

                        _courseTeacherRepository.Insert(courseTeacher);
                        _courseTeacherRepository.Save();
                    }
                }

            }
        }

        public async Task SaveTeacherPermissions(AddTeacherViewModel model, string userId)
        {
            var UserPermissions = await _userPermissionRepository.GetAll().Where(x => x.UserId == userId && x.OwnerId == model.OwnerId).ToListAsync();
            if (UserPermissions.Count != 0)
            {
                _userPermissionRepository.DeleteAll(UserPermissions);
                _userPermissionRepository.Save();
            }

            if (model.IsAllSchoolSelected)
            {
                foreach (var permissionId in model.Permissions.SchoolPermissions.First().PermissionIds)
                {
                    var schoolPermission = new UserPermission
                    {
                        UserId = userId,
                        PermissionId = new Guid(permissionId),
                        TypeId = new Guid(),
                        PermissionType = PermissionTypeEnum.School,
                        OwnerId = model.OwnerId
                    };
                    _userPermissionRepository.Insert(schoolPermission);
                    _userPermissionRepository.Save();
                }

                foreach (var classPermissions in model.Permissions.ClassPermissions)
                {

                    foreach (var permissionId in classPermissions.PermissionIds)
                    {
                        var classPermission = new UserPermission
                        {
                            UserId = userId,
                            PermissionId = new Guid(permissionId),
                            TypeId = classPermissions.ClassId,
                            PermissionType = PermissionTypeEnum.Class,
                            OwnerId = model.OwnerId,
                            SchoolId = classPermissions.SchoolId
                        };
                        _userPermissionRepository.Insert(classPermission);
                        _userPermissionRepository.Save();
                    }
                }

            }

            else
            {
                foreach (var schoolPermissions in model.Permissions.SchoolPermissions)
                {

                    foreach (var permissionId in schoolPermissions.PermissionIds)
                    {
                        var schoolPermission = new UserPermission
                        {
                            UserId = userId,
                            PermissionId = new Guid(permissionId),
                            TypeId = schoolPermissions.SchoolId,
                            PermissionType = PermissionTypeEnum.School,
                            OwnerId = model.OwnerId
                        };
                        _userPermissionRepository.Insert(schoolPermission);
                        _userPermissionRepository.Save();

                    }
                }

                foreach (var classPermissions in model.Permissions.ClassPermissions)
                {

                    foreach (var permissionId in classPermissions.PermissionIds)
                    {
                        var classPermission = new UserPermission
                        {
                            UserId = userId,
                            PermissionId = new Guid(permissionId),
                            TypeId = classPermissions.ClassId,
                            PermissionType = PermissionTypeEnum.Class,
                            OwnerId = model.OwnerId,
                            SchoolId = classPermissions.SchoolId
                        };
                        _userPermissionRepository.Insert(classPermission);
                        _userPermissionRepository.Save();

                    }
                }
                
                foreach (var coursePermissions in model.Permissions.CoursePermissions)
                {

                    foreach (var permissionId in coursePermissions.PermissionIds)
                    {
                        var coursePermission = new UserPermission
                        {
                            UserId = userId,
                            PermissionId = new Guid(permissionId),
                            TypeId = coursePermissions.CourseId,
                            PermissionType = PermissionTypeEnum.Course,
                            OwnerId = model.OwnerId,
                            SchoolId = coursePermissions.SchoolId
                        };
                        _userPermissionRepository.Insert(coursePermission);
                        _userPermissionRepository.Save();

                    }
                }
            }
        }

    }
}
