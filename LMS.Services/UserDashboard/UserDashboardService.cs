using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.UserDashboard;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.UserDashboard
{
    public class UserDashboardService : IUserDashboardService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<School> _schoolRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private IGenericRepository<SchoolFollower> _schoolFollowerRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private IGenericRepository<UserFollower> _userFollowerRepository;
        private IGenericRepository<ClassStudent> _classStudentRepository;
        private IGenericRepository<CourseStudent> _courseStudentRepository;
        public UserDashboardService(IMapper mapper, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<UserFollower> userFollowerRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository)
        {
            _mapper = mapper;
            _schoolRepository = schoolRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _schoolFollowerRepository = schoolFollowerRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _userFollowerRepository = userFollowerRepository;
            _classStudentRepository = classStudentRepository;
            _courseStudentRepository = courseStudentRepository;
        }
        public async Task<UserDashboardViewModel> UserDashboard(string userId)
        {
            var model = new UserDashboardViewModel();

            // owned schools
            var schools = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();
            var OwnedSchools = _mapper.Map<List<SchoolViewModel>>(schools);
            model.OwnedSchools = OwnedSchools;

            // owned classes
            var classes = await _classRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();
            var OwnedClasses = _mapper.Map<List<ClassViewModel>>(classes);
            model.OwnedClasses = OwnedClasses;            

            // owned courses
            var courses = await _courseRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();
            var OwnedCourses = _mapper.Map<List<CourseViewModel>>(courses);
            model.OwnedCourses = OwnedCourses;

            // followed schools
            var schoolFollowers =  await _schoolFollowerRepository.GetAll()
                .Include(x => x.User)
                .Include(x => x.School)
                .Where(x => x.UserId == userId).ToListAsync();

            var followedSchool = _mapper.Map<IEnumerable<SchoolViewModel>>(schoolFollowers.Select(x => x.School).ToList());
            model.FollowedSchools = followedSchool;

            // followed classes
            var classStudents = await _classStudentRepository.GetAll()
                .Include(x => x.Student)
                .Include(x => x.Class)
                .Where(x => x.Student.UserId == userId).ToListAsync();

            var followedClasses = _mapper.Map<IEnumerable<ClassViewModel>>(classStudents.Select(x => x.Class).ToList());
            model.FollowedClasses = followedClasses;

            // followed courses
            var courseStudents = await _courseStudentRepository.GetAll()
                .Include(x => x.Student)
                .Include(x => x.Course)
                .Where(x => x.Student.UserId == userId).ToListAsync();

            var followedCourses = _mapper.Map<IEnumerable<CourseViewModel>>(courseStudents.Select(x => x.Course).ToList());
            model.FollowedCourses = followedCourses;

            return model;
        }

    }
}
