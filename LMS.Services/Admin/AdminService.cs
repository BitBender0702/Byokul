﻿using AutoMapper;
using LMS.Common.ViewModels.Admin;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using LMS.Services.Admin;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public class AdminService : IAdminService
    {
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<School> _schoolRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private readonly IMapper _mapper;

        public AdminService(IGenericRepository<User> userRepository, IMapper mapper, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _schoolRepository = schoolRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
        }
        public async Task<List<RegisteredUsersViewModel>> GetRegisteredUsers()
        {
            var users = await _userRepository.GetAll().ToListAsync();
            var response = _mapper.Map<List<RegisteredUsersViewModel>>(users);
            return response;

        }

        public async Task<bool> BanUser(BanUsersViewModel model)
        {
            var user = await _userRepository.GetAll().Where(x => x.Id == model.UserId).FirstOrDefaultAsync();

            if (user != null)
            {
                user.IsBan = model.IsBan;
                _userRepository.Update(user);
                _userRepository.Save();
                return true;
            }

            return false;

        }

        public async Task<bool> VarifyUser(VerifyUsersViewModel model)
        {
            var user = await _userRepository.GetAll().Where(x => x.Id == model.UserId).FirstOrDefaultAsync();

            if (user != null)
            {
                user.IsVarified = model.IsVerify;
                _userRepository.Update(user);
                _userRepository.Save();
                return true;
            }

            return false;

        }

        public async Task<List<SchoolViewModel>> GetRegisteredSchools()
        {
            var schools = await _schoolRepository.GetAll()
                .Include(x => x.Country)
                .Include(x => x.Specialization)
                .Include(x => x.CreatedBy).ToListAsync();
            var response = _mapper.Map<List<SchoolViewModel>>(schools);
            return response;

        }

        public async Task<bool> BanSchool(BanSchoolsViewModel model)
        {
            var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == model.SchoolId).FirstOrDefaultAsync();

            if (school != null)
            {
                school.IsBan = model.IsBan;
                _schoolRepository.Update(school);
                _schoolRepository.Save();
                return true;
            }

            return false;

        }

        public async Task<bool> VarifySchool(VerifySchoolsViewModel model)
        {
            var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == model.SchoolId).FirstOrDefaultAsync();

            if (school != null)
            {
                school.IsVarified = model.IsVerify;
                _schoolRepository.Update(school);
                _schoolRepository.Save();
                return true;
            }

            return false;

        }

        public async Task<List<ClassViewModel>> GetRegisteredClasses()
        {
            var classes = await _classRepository.GetAll()
                .Include(x => x.School)
                .Include(x => x.ServiceType)
                .Include(x => x.Accessibility)
                .Include(x => x.CreatedBy).ToListAsync();
            var response = _mapper.Map<List<ClassViewModel>>(classes);
            return response;

        }

        public async Task<List<CourseViewModel>> GetRegisteredCourses()
        {
            var courses = await _courseRepository.GetAll()
                .Include(x => x.School)
                .Include(x => x.ServiceType)
                .Include(x => x.Accessibility)
                .Include(x => x.CreatedBy).ToListAsync();
            var response = _mapper.Map<List<CourseViewModel>>(courses);
            return response;

        }

        public async Task<bool> DisableClass(DisableClassCourseViewModel model)
        {
            var classes = await _classRepository.GetAll().Where(x => x.ClassId == model.Id).FirstOrDefaultAsync();

            if (classes != null)
            {
                classes.IsEnable = model.IsDisable;
                _classRepository.Update(classes);
                _classRepository.Save();
                return true;
            }

            return false;

        }

        public async Task<bool> DisableCourse(DisableClassCourseViewModel model)
        {
            var course = await _courseRepository.GetAll().Where(x => x.CourseId == model.Id).FirstOrDefaultAsync();

            if (course != null)
            {
                course.IsEnable = model.IsDisable;
                _courseRepository.Update(course);
                _courseRepository.Save();
                return true;
            }

            return false;

        }

        public async Task<AdminDashboardViewModel> GetDashboardDetails()
        {
            var model = new AdminDashboardViewModel();
            model.NoOfRegUsers =  _userRepository.GetAll().Count();
            model.NoOfRegSchools = _schoolRepository.GetAll().Count();
            model.NoOfClasses = _classRepository.GetAll().Count();
            model.NoOfCourses = _courseRepository.GetAll().Count();

            return model;

        }
    }
}