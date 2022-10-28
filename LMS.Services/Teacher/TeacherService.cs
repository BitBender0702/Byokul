using AutoMapper;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
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
        public TeacherService(IMapper mapper, IGenericRepository<Teacher> teacherRepository, IGenericRepository<SchoolTeacher> schoolTeacherRepository, IGenericRepository<TeacherCertificate> teacherCertificateRepository)
        {
            _mapper = mapper;
            _teacherRepository = teacherRepository;
            _schoolTeacherRepository = schoolTeacherRepository;
            _teacherCertificateRepository = teacherCertificateRepository;
        }

        public async Task SaveNewTeacher(TeacherViewModel teacherViewModel, Guid schoolId, string createdById)
        {
            var teacher = new Teacher
            {
                FirstName = teacherViewModel.FirstName,
                LastName = teacherViewModel.LastName,
                Description = teacherViewModel.Description,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow
            };

            _teacherRepository.Insert(teacher);
            try
            {
                _schoolTeacherRepository.Save();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            await SaveInSchoolTeachers(teacher.TeacherId, schoolId);

            if (teacherViewModel.TeacherCertificateViewModel != null) {
                await SaveTeacherCertificate(teacherViewModel.TeacherCertificateViewModel, teacher.TeacherId);
            }
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
    }
}
