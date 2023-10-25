using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.User;
using LMS.Common.ViewModels.UserDashboard;
using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using LMS.DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using MimeKit;
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
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<ChatHead> _ChatHeadRepository;
        private IGenericRepository<Notification> _NotificationRepository;
        private IGenericRepository<SchoolTeacher> _schoolTeacherRepository;

        public UserDashboardService(IMapper mapper, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<UserFollower> userFollowerRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<User> userRepository, IGenericRepository<ChatHead> ChatHeadRepository, IGenericRepository<Notification> NotificationRepository, IGenericRepository<SchoolTeacher> schoolTeacherRepository)
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
            _userRepository = userRepository;
            _ChatHeadRepository = ChatHeadRepository;
            _NotificationRepository = NotificationRepository;
            _schoolTeacherRepository = schoolTeacherRepository;
        }
        public async Task<UserDashboardViewModel> UserDashboard(string userId)
        {
            var model = new UserDashboardViewModel();

            // user details
            var user = _userRepository.GetById(userId);
            model.User = _mapper.Map<UserUpdateViewModel>(user);

            // owned schools
            var schools = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId && !x.IsDeleted).ToListAsync();
            var teacherSchools = await _schoolTeacherRepository.GetAll().Include(x => x.Teacher).Include(x => x.School).Where(x => x.Teacher.UserId == userId).Select(x => x.School).ToListAsync();
            schools = schools.Concat(teacherSchools).Distinct() .ToList();
            var OwnedSchools = _mapper.Map<List<SchoolViewModel>>(schools);
            model.OwnedSchools = OwnedSchools;

            var teacherSchoolIds = await _schoolTeacherRepository.GetAll().Include(x => x.Teacher).Where(x => x.Teacher.UserId == userId).Select(x => x.SchoolId).ToListAsync();
            var schoolIds = model.OwnedSchools.Select(x => x.SchoolId).ToList();

            //schoolIds.AddRange((IEnumerable<Guid>)teacherSchoolIds);

            schoolIds = schoolIds
                .Concat(teacherSchoolIds.Where(id => id.HasValue).Select(id => id.Value))
                .Distinct()
                .ToList();

            var classes = _classRepository.GetAll().Include(x => x.School).AsEnumerable().Where(x => schoolIds.Any(schoolId => schoolId == x.SchoolId) && !x.IsCourse && !x.IsDeleted).ToList();

            // owned classes
            //var classes = await _classRepository.GetAll().Include(x => x.School).Where(x => x.CreatedById == userId && !x.IsCourse && !x.IsDeleted).ToListAsync();
            var OwnedClasses = _mapper.Map<List<ClassViewModel>>(classes);
            model.OwnedClasses = OwnedClasses;
            // owned courses
            //var courses = await _courseRepository.GetAll().Where(x => x.CreatedById == userId && !x.IsDeleted).ToListAsync();
            var courses =  _courseRepository.GetAll().Include(x => x.School).AsEnumerable().Where(x => schoolIds.Any(schoolId => schoolId == x.SchoolId) && !x.IsDeleted).ToList();

            var classAsCourse = _classRepository.GetAll().Include(x => x.School).AsEnumerable().Where(x => schoolIds.Any(schoolId => schoolId == x.SchoolId) && x.IsCourse).ToList();

            foreach (var classInfo in classAsCourse)
            {
                var course = new Course();
                course.CourseId = classInfo.ClassId;
                course.CourseName = classInfo.ClassName;
                course.School = classInfo.School;
                course.Avatar = classInfo.Avatar;
                courses.Add(course);
            }


            var OwnedCourses = _mapper.Map<List<CourseViewModel>>(courses);
            model.OwnedCourses = OwnedCourses;

            // followed schools
            var schoolFollowers = await _schoolFollowerRepository.GetAll()
                .Include(x => x.User)
                .Include(x => x.School)
                .Where(x => x.UserId == userId && !x.School.IsDeleted).ToListAsync();


            var followedSchool = _mapper.Map<IEnumerable<SchoolViewModel>>(schoolFollowers.Select(x => x.School).ToList());
            followedSchool = followedSchool.Where(x => !(OwnedSchools.Any(y => y.SchoolId == x.SchoolId))).ToList();
            model.FollowedSchools = followedSchool;

            // followed classes
            var classStudents = await _classStudentRepository.GetAll()
                .Include(x => x.Student)
                .Include(x => x.Class)
                .Where(x => x.Student.UserId == userId && !x.Class.IsDeleted).ToListAsync();

            var followedClasses = _mapper.Map<IEnumerable<ClassViewModel>>(classStudents.Select(x => x.Class).ToList());
            model.FollowedClasses = followedClasses;

            // followed courses
            var courseStudents = await _courseStudentRepository.GetAll()
                .Include(x => x.Student)
                .Include(x => x.Course)
                .Where(x => x.Student.UserId == userId && !x.Course.IsDeleted).ToListAsync();

            var followedCourses = _mapper.Map<IEnumerable<CourseViewModel>>(courseStudents.Select(x => x.Course).ToList());
            model.FollowedCourses = followedCourses;

            //unread messages

            var unreadMessages = await _ChatHeadRepository.GetAll().Where(x => x.ReceiverId == userId).Select(x => x.UnreadMessageCount).ToListAsync();
            int messageCount = 0;
            foreach (var item in unreadMessages)
            {
                messageCount = messageCount + item;
            }

            model.UnreadMessageCount = messageCount;

            var unreadNotifications = await _NotificationRepository.GetAll().Where(x => x.UserId == userId && !x.IsRead).ToListAsync();
            model.UnreadNotificationCount = unreadNotifications.Count;
            return model;
        }

    }
}
