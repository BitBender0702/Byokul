using LMS.DataAccess.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS.Data.Entity;
using AutoMapper;
using LMS.Common.ViewModels.Notification;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace LMS.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IGenericRepository<Notification> _notificationRepository;
        private readonly IGenericRepository<NotificationSeeting> _notificationSettingRepository;
        private readonly IGenericRepository<UserNotificationSetting> _userNotificationSettingRepository;
        private readonly IGenericRepository<UserFollower> _userFollowerRepository;
        private readonly IGenericRepository<SchoolFollower> _schoolFollowerRepository;
        private readonly IGenericRepository<SchoolTeacher> _schoolTeacherRepository;
        private readonly IGenericRepository<ClassStudent> _classStudentRepository;
        private readonly IGenericRepository<CourseStudent> _courseStudentRepository;
        private readonly IGenericRepository<ClassTeacher> _classTeacherRepository;
        private readonly IGenericRepository<CourseTeacher> _courseTeacherRepository;
        private readonly IGenericRepository<Class> _classRepository;
        private readonly IGenericRepository<Course> _courseRepository;


        private readonly IMapper _mapper;
        public NotificationService(IMapper mapper, IGenericRepository<NotificationSeeting> notificationSettingRepository, IGenericRepository<Notification> notificationRepository, IGenericRepository<UserNotificationSetting> userNotificationSettingRepository, IGenericRepository<UserFollower> userFollowerRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<SchoolTeacher> schoolTeacherRepository, IGenericRepository<Class> classRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<Course> courseRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<CourseTeacher> courseTeacherRepository)
        {
            _notificationSettingRepository = notificationSettingRepository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _userNotificationSettingRepository = userNotificationSettingRepository;
            _userFollowerRepository = userFollowerRepository;
            _schoolFollowerRepository = schoolFollowerRepository;
            _schoolTeacherRepository = schoolTeacherRepository;
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
            _courseStudentRepository = courseStudentRepository;
            _courseRepository = courseRepository;
            _classTeacherRepository = classTeacherRepository;
            _courseTeacherRepository = courseTeacherRepository;
        }


        public async Task<List<NotificationSettingViewModel>> GetNotificationSettings(string userId)
        {
            var notificationSettings = await _notificationSettingRepository.GetAll().OrderBy(x => x.DateTime).ToListAsync();



            var result = _mapper.Map<List<NotificationSettingViewModel>>(notificationSettings);

            var userNotificationSettings = await _userNotificationSettingRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();


            foreach (var item in result)
            {
                var response = userNotificationSettings.Where(x => x.NotificationSettingId == item.Id && x.UserId == userId).FirstOrDefault();

                if (response != null)
                {
                    item.IsSettingActive = response.IsActive;
                }

            }

            return result;
        }

        public async Task<List<FollowerNotificationSettingViewModel>> GetFollowersNotificationSettings(string followersIds)
        {
            var followersIdsList = JsonConvert.DeserializeObject<List<string>>(followersIds);


            var lectureStartSetting = await _userNotificationSettingRepository.GetAll().Where(x => followersIdsList.Contains(x.UserId) && x.NotificationSetting.Name == "Lecture Start" && !x.IsActive).Select(x => new FollowerNotificationSettingViewModel
            {
                UserId = x.UserId,
                IsNotificationActive = x.IsActive
            }).ToListAsync();

            return lectureStartSetting;
        }


        public async Task<List<NotificationViewModel>> GetNotifications(string userId, int pageNumber)
        {
            int pageSize = 12;
            var notifications = await _notificationRepository.GetAll().Include(x => x.User).Include(x => x.Post).Where(x => x.UserId == userId).OrderByDescending(x => x.DateTime).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            return _mapper.Map<List<NotificationViewModel>>(notifications);
        }

        public async Task<NotificationViewModel> AddNotification(NotificationViewModel model)
        {
            if (model.PostId == new Guid("00000000-0000-0000-0000-000000000000"))
            {
                model.PostId = null;
            }

            var notification = new Notification
            {
                UserId = model.UserId,
                ActionDoneBy = model.ActionDoneBy,
                Avatar = model.Avatar,
                IsRead = model.IsRead,
                NotificationContent = model.NotificationContent,
                NotificationType = model.NotificationType,
                DateTime = DateTime.UtcNow,
                PostId = model.PostId,
                PostType = model.PostType,
                ReelId = model.ReelId == null ? null : new Guid(model.ReelId),
                ChatType = model.ChatType,
                ChatTypeId = model.ChatTypeId,
                MeetingId = model.MeetingId
            };

            _notificationRepository.Insert(notification);
            _notificationRepository.Save();

            model.Id = notification.Id;
            return model;

        }


        public async Task RemoveUnreadNotifications(string userId)
        {
            var result = await _notificationRepository.GetAll().Where(x => x.UserId == userId && !x.IsRead).ToListAsync();
            if (result.Count > 0)
            {
                foreach (var item in result)
                {
                    item.IsRead = true;
                    _notificationRepository.Update(item);
                    _notificationRepository.Save();
                }
            }
        }


        public async Task SaveNotificationSettings(List<NotificationSettingViewModel> model, string userId)
        {
            var result = await _userNotificationSettingRepository.GetAll().ToListAsync();
            foreach (var item in model)
            {
                var isUserNotificationSettingExist = result.Where(x => x.UserId == userId && x.NotificationSettingId == item.Id).FirstOrDefault();

                if (isUserNotificationSettingExist != null)
                {
                    isUserNotificationSettingExist.IsActive = item.IsSettingActive;
                    _userNotificationSettingRepository.Update(isUserNotificationSettingExist);
                    _userNotificationSettingRepository.Save();
                }
                else
                {
                    var userNotificationSetting = new UserNotificationSetting
                    {
                        UserId = userId,
                        NotificationSettingId = item.Id,
                        IsActive = item.IsSettingActive
                    };

                    _userNotificationSettingRepository.Insert(userNotificationSetting);
                    _userNotificationSettingRepository.Save();
                }
            }
        }

        public async Task SaveTransactionNotification(NotificationViewModel notificationViewModel)
        {
            var notification = new Notification
            {
                UserId = notificationViewModel.UserId,
                Avatar = notificationViewModel.Avatar,
                IsRead = false,
                NotificationContent = notificationViewModel.NotificationContent,
                NotificationType = NotificationTypeEnum.Transaction,
                DateTime = DateTime.UtcNow,
                ChatTypeId = notificationViewModel.ChatTypeId
            };

            _notificationRepository.Insert(notification);
            _notificationRepository.Save();
        }

        public async Task<List<string>> GetUserFollowersIds(string userId)
        {
            var userFollwers = await _userFollowerRepository.GetAll().Where(x => x.UserId == userId).Select(x => x.FollowerId).ToListAsync();
            return userFollwers;
        }

        public async Task<List<string>> GetSchoolFollowersIds(Guid schoolId)
        {
            var schoolFollowers = await _schoolFollowerRepository.GetAll().Where(x => x.SchoolId == schoolId).Select(x => x.UserId).ToListAsync();

            var schoolTeachers = await _schoolTeacherRepository.GetAll().Include(x => x.Teacher).Where(x => x.SchoolId == schoolId).Select(x => x.Teacher.UserId).ToListAsync();

            // class students
            var classList = await _classRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();
            var classStudentsList = await _classStudentRepository.GetAll().Include(x => x.Student).Distinct().ToListAsync();
            var classStudents = classStudentsList.Where(x => classList.Any(y => y.ClassId == x.ClassId)).DistinctBy(x => x.StudentId).Select(x => x.Student.UserId);


            //course students
            var courseList = await _courseRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();
            var courseStudentsList = await _courseStudentRepository.GetAll().Include(x => x.Student).Distinct().ToListAsync();
            var courseStudents = courseStudentsList.Where(x => courseList.Any(y => y.CourseId == x.CourseId)).DistinctBy(x => x.StudentId).Select(x => x.Student.UserId);

            //class teachers
            var classTeachersList = await _classTeacherRepository.GetAll().Include(x => x.Teacher).Distinct().ToListAsync();
            var classTeachers = classTeachersList.Where(x => classList.Any(y => y.ClassId == x.ClassId)).DistinctBy(x => x.TeacherId).Select(x => x.Teacher.UserId);

            //course teachers
            var courseTeachersList = await _courseTeacherRepository.GetAll().Include(x => x.Teacher).Distinct().ToListAsync();
            var courseTeachers = courseTeachersList.Where(x => courseList.Any(y => y.CourseId == x.CourseId)).DistinctBy(x => x.TeacherId).Select(x => x.Teacher.UserId);

            var combinedList = schoolFollowers.Union(schoolTeachers).Union(classStudents).Union(classTeachers).Union(courseStudents).Union(courseTeachers).Distinct().ToList();

            return combinedList;
        }

        public async Task<List<string>> GetClassFollowersIds(Guid classId)
        {
            //class students
            var classStudents = await _classStudentRepository.GetAll().Include(x => x.Student).Where(x => x.ClassId == classId).Distinct().Select(x => x.Student.UserId).ToListAsync();

            var classTeachers = await _classTeacherRepository.GetAll().Include(x => x.Teacher).Where(x => x.ClassId == classId).Distinct().Select(x => x.Teacher.UserId).ToListAsync();

            var combinedList = classStudents.Union(classTeachers).ToList();
            return combinedList;
        }
    }
}
