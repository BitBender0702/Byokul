using AutoMapper;
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.School;
using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using LMS.DataAccess.GenericRepository;
using LMS.DataAccess.Repository;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Math.EC.Rfc7748;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace LMS.Services.Chat
{
    public class ChatService : IChatService
    {
        private readonly IGenericRepository<ChatMessage> _chatMessageRepository;
        private readonly IGenericRepository<ChatHead> _chatHeadRepository;
        private readonly IGenericRepository<Attachment> _attachmentRepository;
        private readonly IGenericRepository<School> _schoolRepository;
        private readonly IGenericRepository<Class> _classRepository;
        private readonly IGenericRepository<Course> _courseRepository;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;
        private readonly IBlobService _blobService;
        public ChatService(IGenericRepository<ChatMessage> repository, IMapper mapper, IGenericRepository<ChatHead> chatHeadRepository, IBlobService blobService, IGenericRepository<Attachment> attachmentRepo, UserManager<User> userManager, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository)
        {
            _chatMessageRepository = repository;
            _chatHeadRepository = chatHeadRepository;
            _mapper = mapper;
            _blobService = blobService;
            _attachmentRepository = attachmentRepo;
            _userManager = userManager;
            _schoolRepository = schoolRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
        }
        public async Task<ChatMessageViewModel> AddChatMessage(ChatMessageViewModel chatViewModel)
        {
            //upload 
            if (chatViewModel.ChatHeadId == default)
            {
                chatViewModel.ChatHeadId = await AddChatHead(new ChatHeadViewModel
                {
                    ChatType = chatViewModel.ChatType,
                    ChatTypeId = chatViewModel.ChatTypeId,
                    UnreadMessageCount = 1,
                    ReceiverId = chatViewModel.Receiver.ToString(),
                    SenderId = chatViewModel.Sender.ToString(),
                    LastMessage = chatViewModel.Message
                });
            }
            else
            {

                await UpdateChatHead(chatViewModel);

            }
            var chatModel = _mapper.Map<ChatMessage>(chatViewModel);
            chatModel.Id = Guid.NewGuid();
            chatModel.CreatedOn = DateTime.Now;
            chatModel.IsRead = false;
            chatModel.SenderId = chatViewModel.Sender;
            chatModel.ReceiverId = chatViewModel.Receiver;
            _chatMessageRepository.Insert(chatModel);
            try
            {
                _chatMessageRepository.Save();

            }
            catch (Exception ex)
            {

                throw ex;
            }
            return chatViewModel;
        }

        private async Task<string> saveAttachmentsAndReturnURL(IEnumerable<IFormFile>? attachments)
        {

            //save attachments to blobs
            List<string> result = new List<string>();
            return JsonConvert.SerializeObject(result);
        }

        public async Task<Guid> AddChatHead(ChatHeadViewModel chatViewModel)
        {

            var chatHead = _mapper.Map<ChatHead>(chatViewModel);

            chatHead.Id = Guid.NewGuid();
            chatHead.UnreadMessageCount = 1;
            chatHead.SenderId = chatViewModel.SenderId;
            chatHead.ReceiverId = chatViewModel.ReceiverId;
            _chatHeadRepository.Insert(chatHead);
            try
            {
                _chatHeadRepository.Save();
            }
            catch (Exception ex)
            {

                throw ex;
            }
            return chatHead.Id;

        }

        public async Task UpdateChatHead(ChatMessageViewModel chatheadViewModel)
        {
            var existingChatHead = _chatHeadRepository.GetAll().Where(x => x.Id == chatheadViewModel.ChatHeadId).FirstOrDefault();
            if (existingChatHead is null)
            {
                throw new ArgumentException();
            }
            existingChatHead.LastMessage = chatheadViewModel.Message;
            if (chatheadViewModel.Sender == new Guid(existingChatHead.SenderId))
            {
                existingChatHead.UnreadMessageCount += 1;
            }

            if (chatheadViewModel.Sender != new Guid(existingChatHead.SenderId))
            {
                existingChatHead.SenderId = chatheadViewModel.Sender.ToString();
                existingChatHead.ReceiverId = chatheadViewModel.Receiver.ToString();
                existingChatHead.UnreadMessageCount = 1;
            }

            _chatHeadRepository.Update(existingChatHead);

        }

        public Task<ChatMessageViewModel> GetChatMessageForChatHead(Guid chatHeadId)
        {
            throw new NotImplementedException();
        }

        public async Task<ChatHeadViewModel> GetChatHead(Guid sender, Guid receiver, ChatType chatType)
        {
            ChatHead res;
            res = _chatHeadRepository.GetFirstOrDefaultBy(x => x.SenderId == sender.ToString() && x.ReceiverId == receiver.ToString() && x.ChatType == chatType);

            if (res is null)
                res = _chatHeadRepository.GetFirstOrDefaultBy(x => x.SenderId == receiver.ToString() && x.ReceiverId == sender.ToString() && x.ChatType == chatType);

            var result = _mapper.Map<ChatHeadViewModel>(res);
            if (result == null)
            {
                return null;
            }
            return result;
        }



        public Task<List<ChatHeadViewModel>> GetChatHeadsForReceiver(string receiver)
        {
            throw new NotImplementedException();
        }

        public async Task<List<ChatAttachmentResponse>> SaveChatAttachments(SaveChatAttachmentViewModel model)
        {
            var containerName = "chatattachments";
            var response = new List<ChatAttachmentResponse>();
            foreach (var attachment in model.File)
            {
                var chatAttach = new ChatAttachmentResponse();
                chatAttach.FileURL = await _blobService.UploadFileAsync(attachment, containerName);

                chatAttach.FileName = attachment.FileName;
                chatAttach.FileType = model.FileType;
                response.Add(chatAttach);

            }
            return response;
        }

        public async Task<List<ChatUsersViewModel>> GetAllChatHeadForLoggedInUser(Guid userId)
        {

            List<ChatUsersViewModel> users = new List<ChatUsersViewModel>();
            var res = _chatHeadRepository.GetAll().Include(x => x.Receiver).Where(x => x.SenderId == userId.ToString() || x.ReceiverId == userId.ToString()).ToList();

            var first = res.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Personal).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                ChatType = x.ChatType,
                UnreadMessageCount = x.UnreadMessageCount
            }).ToList();

            users = users.Concat(first).ToList();

            var second = res.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Personal).Select(x => new ChatUsersViewModel { UserID = new Guid(x.ReceiverId), User2ID = new Guid(x.SenderId), LastMessage = x.LastMessage, ChatHeadId = x.Id, ChatType = x.ChatType/*, UnreadMessageCount = x.UnreadMessageCount */}).ToList();

            users = users.Concat(second).ToList();

            var third = res.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.School).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                School = GetSchoolInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                UnreadMessageCount = x.UnreadMessageCount
            }).ToList();

            users = users.Concat(third).ToList();

            var fourth = res.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.School).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                School = GetSchoolInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();

            users = users.Concat(fourth).ToList();

            var five = res.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Class).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Class = GetClassInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                UnreadMessageCount = x.UnreadMessageCount
            }).ToList();

            users = users.Concat(five).ToList();

            var six = res.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Class).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Class = GetClassInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();

            users = users.Concat(six).ToList();

            var seven = res.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Course).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Course = GetCourseInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                UnreadMessageCount = x.UnreadMessageCount
            }).ToList();

            users = users.Concat(seven).ToList();

            var eight = res.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Course).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Course = GetCourseInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();

            users = users.Concat(eight).ToList();

            var chatRepo = _chatMessageRepository.GetAll();
            var attachRepo = _attachmentRepository.GetAll();
            foreach (var chatUser in users)
            {
                if (res.First(x => x.Id == chatUser.ChatHeadId).SenderId == userId.ToString() && res.First(x => x.Id == chatUser.ChatHeadId).IsPinnedUser1)
                {
                    chatUser.IsPinned = true;
                }
                if (res.First(x => x.Id == chatUser.ChatHeadId).ReceiverId == userId.ToString() && res.First(x => x.Id == chatUser.ChatHeadId).IsPinnedUser2)
                {
                    chatUser.IsPinned = true;
                }

                var LastChatObject = chatRepo.Where(x => x.ChatHeadId == chatUser.ChatHeadId).OrderByDescending(x => x.CreatedOn).First();
                var chatId = LastChatObject.Id;
                LastChatObject.Attachments = await attachRepo.Where(x => x.ChatMessageId == chatId).ToListAsync();


                var receiverUser = await _userManager.FindByIdAsync(LastChatObject.ReceiverId == userId ? LastChatObject.SenderId.ToString() : LastChatObject.ReceiverId.ToString());

                if (chatUser.LastMessage is null)
                {
                    chatUser.FileName = attachRepo.Where(x => x.ChatMessageId == chatId).First().FileName;
                }
                chatUser.Time = LastChatObject.CreatedOn;

                if (chatUser.ChatType == ChatType.School)
                {
                    chatUser.ProfileURL = chatUser.School.Avatar;
                    chatUser.UserName = chatUser.School.SchoolName;
                }
                else if (chatUser.ChatType == ChatType.Class)
                {
                    chatUser.ProfileURL = chatUser.Class.Avatar;
                    chatUser.UserName = chatUser.Class.ClassName;
                }
                else if (chatUser.ChatType == ChatType.Course)
                {
                    chatUser.ProfileURL = chatUser.Course.Avatar;
                    chatUser.UserName = chatUser.Course.CourseName;
                }
                else
                {
                    chatUser.ProfileURL = receiverUser.Avatar;
                    chatUser.UserName = receiverUser.FirstName + " " + receiverUser.LastName;
                }
            }
            users = users.OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.Time).ToList();

            var firstUser = users.Where(x => x.ChatType == ChatType.Personal).FirstOrDefault();
            if (firstUser != null)
            {
                firstUser.Chats = await GetParticularUserChat(userId, firstUser.UserID, ChatType.Personal);
                await RemoveUnreadMessageCount(userId, firstUser.UserID, ChatType.Personal);

            }

            var firstSchool = users.Where(x => x.ChatType == ChatType.School).FirstOrDefault();
            if (firstSchool != null)
            {
                firstSchool.Chats = await GetParticularUserChat(userId, firstSchool.UserID, ChatType.School);
            }

            var firstClass = users.Where(x => x.ChatType == ChatType.Class).FirstOrDefault();
            if (firstClass != null)
            {
                firstClass.Chats = await GetParticularUserChat(userId, firstClass.UserID, ChatType.Class);
            }

            var firstCourse = users.Where(x => x.ChatType == ChatType.Course).FirstOrDefault();
            if (firstCourse != null)
            {
                firstCourse.Chats = await GetParticularUserChat(userId, firstCourse.UserID, ChatType.Course);
            }
            return users;
        }

        public SchoolUpdateViewModel GetSchoolInfo(Guid? schoolId)
        {
            var school = _schoolRepository.GetById(schoolId);
            return new SchoolUpdateViewModel { SchoolId = school.SchoolId, SchoolName = school.SchoolName, Avatar = school.Avatar, OwnerId = school.CreatedById };
        }

        public ClassViewModel GetClassInfo(Guid? classId)
        {
            var classes = _classRepository.GetById(classId);
            return new ClassViewModel { ClassId = classes.ClassId, ClassName = classes.ClassName, Avatar = classes.Avatar, CreatedById = classes.CreatedById, SchoolId = classes.SchoolId };
        }

        public CourseViewModel GetCourseInfo(Guid? classId)
        {
            var course = _courseRepository.GetById(classId);
            return new CourseViewModel { CourseId = course.CourseId, CourseName = course.CourseName, Avatar = course.Avatar, CreatedById = course.CreatedById, SchoolId = course.SchoolId };
        }

        public async Task<IEnumerable<ParticularChat>> GetParticularUserChat(Guid SenderId, Guid ReceiverId, ChatType chatType, int pageSize = 2, int pageNumber = 1)
        {
            const int MinimumPageSize = 10;
            var attachRepo = _attachmentRepository.GetAll();
            var chatRepo = _chatMessageRepository.GetAll().Where(x => !x.IsDeleted).Include(x => x.ChatHead).Where(x => (x.SenderId == SenderId && x.ReceiverId == ReceiverId && x.ChatHead.ChatType == chatType) || (x.SenderId == ReceiverId && x.ReceiverId == SenderId && x.ChatHead.ChatType == chatType));

            if (chatRepo.Count() < MinimumPageSize)
                chatRepo = chatRepo.OrderByDescending(x => x.CreatedOn);
            else
                chatRepo = chatRepo.Skip((pageNumber - 1) * pageSize).Take(pageSize);


            List<ParticularChat> chatList = new List<ParticularChat>();

            foreach (var item in chatRepo)
            {
                var partChat = new ParticularChat { Time = item.CreatedOn };
                var AttachRepoObject = await attachRepo.Where(x => x.ChatMessageId == item.Id).ToListAsync();
                //if (item.Message is null)
                //{
                if (AttachRepoObject != null)
                {
                    partChat.Attachment = _mapper.Map<List<AttachmentViewModel>>(AttachRepoObject);

                }
                //}
                //else
                //{
                partChat.Text = item.Message;
                //}
                if (item.SenderId == SenderId)
                    partChat.SendByMe = true;

                partChat.SendByMe = item.SenderId == SenderId ? true : false;

                chatList.Add(partChat);
            }
            return chatList.OrderBy(x => x.Time);
        }
        public async Task<bool> SetParticularUserPinned(Guid SenderId, Guid ReceiverId, ChatType chatType)
        {

            var chatHeadObject = _chatHeadRepository.GetAll().Where(x => (x.SenderId == SenderId.ToString() && x.ReceiverId == ReceiverId.ToString() && x.ChatType == chatType) || (x.SenderId == ReceiverId.ToString() && x.ReceiverId == SenderId.ToString() && x.ChatType == chatType)).First();

            string SenderCol = chatHeadObject.SenderId == SenderId.ToString() ? "User1" : "User2";

            if (SenderCol == "User1")
                chatHeadObject.IsPinnedUser1 = chatHeadObject.IsPinnedUser1 == false ? true : false;
            else
                chatHeadObject.IsPinnedUser2 = chatHeadObject.IsPinnedUser2 == false ? true : false;

            _chatHeadRepository.Save();

            return chatHeadObject.IsPinnedUser2;

        }

        public async Task RemoveUnreadMessageCount(Guid SenderId, Guid ReceiverId, ChatType chatType)
        {
            var result = await _chatHeadRepository.GetAll().Where(x => /*(x.SenderId == SenderId.ToString() && x.ReceiverId == ReceiverId.ToString() && x.ChatType == chatType) || (*/x.SenderId == ReceiverId.ToString() && x.ReceiverId == SenderId.ToString() && x.ChatType == chatType)/*)*/.FirstOrDefaultAsync();
            if (result!= null)
            {
                if (result.UnreadMessageCount != 0)
                {
                    result.UnreadMessageCount = 0;
                    _chatHeadRepository.Update(result);
                    _chatHeadRepository.Save();
                }
            }
        }

    }
}
