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

namespace LMS.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IGenericRepository<Notification> _notificationRepository;
        private readonly IGenericRepository<NotificationSeeting> _notificationSettingRepository;
        private readonly IGenericRepository<UserNotificationSetting> _userNotificationSettingRepository;
        private readonly IMapper _mapper;
        public NotificationService(IMapper mapper, IGenericRepository<NotificationSeeting> notificationSettingRepository, IGenericRepository<Notification> notificationRepository, IGenericRepository<UserNotificationSetting> userNotificationSettingRepository)
        {
            _notificationSettingRepository = notificationSettingRepository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _userNotificationSettingRepository = userNotificationSettingRepository;
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
                ChatTypeId = model.ChatTypeId
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
    }
}
