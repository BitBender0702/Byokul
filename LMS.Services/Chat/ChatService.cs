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
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.User;
using LMS.Common.Enums;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Crypto;

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
        private readonly IGenericRepository<Comment> _commentRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<CommentLike> _commentLikeRepository;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;
        private readonly IBlobService _blobService;
        public ChatService(IGenericRepository<ChatMessage> repository, IMapper mapper, IGenericRepository<ChatHead> chatHeadRepository, IBlobService blobService, IGenericRepository<Attachment> attachmentRepo, UserManager<User> userManager, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<Comment> commentRepository, IGenericRepository<User> userRepository, IGenericRepository<CommentLike> commentLikeRepository)
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
            _commentRepository = commentRepository;
            _userRepository = userRepository;
            _commentLikeRepository = commentLikeRepository;
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
                    LastMessage = chatViewModel.Message,
                    SchoolId = chatViewModel.SchoolId
                });
            }
            else
            {

                await UpdateChatHead(chatViewModel);

            }
            var chatModel = _mapper.Map<ChatMessage>(chatViewModel);
            chatModel.Id = Guid.NewGuid();
            chatModel.CreatedOn = DateTime.UtcNow;
            chatModel.IsRead = false;
            chatModel.SenderId = chatViewModel.Sender;
            chatModel.ReceiverId = chatViewModel.Receiver;
            chatModel.IsForwarded = chatViewModel.ForwardedFileURL != null ? null : chatViewModel.IsForwarded;
            chatModel.ReplyMessageId = chatViewModel.ReplyMessageId == null ? null : chatViewModel.ReplyMessageId;
            _chatMessageRepository.Insert(chatModel);

            if (chatViewModel.IsForwarded == true && chatViewModel.ForwardedFileURL != null)
            {
                var attachment = new Attachment
                {
                    FileName = chatViewModel.ForwardedFileName,
                    FileType = (Data.Entity.Chat.FileTypeEnum)chatViewModel.ForwardedFileType,
                    FileURL = chatViewModel.ForwardedFileURL,
                    ChatMessageId = chatModel.Id,
                    IsForwarded = chatViewModel.IsForwarded
                };

                _attachmentRepository.Insert(attachment);

            }
            try
            {
                _chatMessageRepository.Save();

            }
            catch (Exception ex)
            {

                throw ex;
            }
            chatViewModel.Id = chatModel.Id;
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

        public async Task<ChatHeadViewModel> GetChatHead(Guid sender, Guid receiver, ChatType chatType, Guid? chatTypeId)
        {
            ChatHead res;
            res = _chatHeadRepository.GetFirstOrDefaultBy(x => x.SenderId == sender.ToString() && x.ReceiverId == receiver.ToString() && x.ChatType == chatType && ((string.IsNullOrEmpty(chatTypeId.ToString())) || (x.ChatTypeId == chatTypeId)));

            if (res is null)
                res = _chatHeadRepository.GetFirstOrDefaultBy(x => x.SenderId == receiver.ToString() && x.ReceiverId == sender.ToString() && x.ChatType == chatType && ((string.IsNullOrEmpty(chatTypeId.ToString())) || (x.ChatTypeId == chatTypeId)));

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
                chatAttach.FileURL = await _blobService.UploadFileAsync(attachment, containerName, false);
                chatAttach.FileName = attachment.FileName;
                chatAttach.FileType = model.FileType;
                response.Add(chatAttach);

            }
            return response;
        }

        public async Task<List<ChatUsersViewModel>> GetAllChatHeadForLoggedInUser(Guid userId, int pageNumber, string? searchString)
        {
            int pageSize =10;
            List<ChatUsersViewModel> users = new List<ChatUsersViewModel>();
            var chatHeads = new List<ChatHead>();
            chatHeads = _chatHeadRepository.GetAll().Include(x => x.Receiver).Include(x => x.Sender).Where(x => x.SenderId == userId.ToString() || x.ReceiverId == userId.ToString()).ToList();

            if (searchString != null)
            {
                var schoolList = new List<School>();
                var classList = new List<Class>();
                var courseList = new List<Course>();
                var userList = new List<User>();

                foreach (var chatHead in chatHeads)
                {
                    if (chatHead.ChatType == ChatType.School)
                    {
                        var school = _schoolRepository.GetById(chatHead.ChatTypeId);
                        schoolList.Add(school);
                    }
                }

                foreach (var chatHead in chatHeads)
                {
                    if (chatHead.ChatType == ChatType.Class)
                    {
                        var classes = _classRepository.GetById(chatHead.ChatTypeId);
                        classList.Add(classes);
                    }
                }

                foreach (var chatHead in chatHeads)
                {
                    if (chatHead.ChatType == ChatType.Course)
                    {
                        var course = _courseRepository.GetById(chatHead.ChatTypeId);
                        courseList.Add(course);
                    }
                }

                var userChatHeads = chatHeads.Where(x => x.ChatType == ChatType.Personal).ToList();
                foreach (var chatHead in userChatHeads)
                {
                    if (chatHead.ChatType == ChatType.Personal)
                    {
                        //var user = await _userRepository.GetAll().Where(x => x.Id == chatHead.SenderId || x.Id == chatHead.ReceiverId).FirstAsync();
                        var user = await _userRepository.GetAll()
    .Where(x => (x.Id == chatHead.SenderId && chatHead.SenderId != userId.ToString() && chatHead.ChatType == ChatType.Personal) || (x.Id == chatHead.ReceiverId && chatHead.ReceiverId != userId.ToString() && chatHead.ChatType == ChatType.Personal))
    .FirstAsync();

                        userList.Add(user);
                    }
                }

                var a = schoolList.Any(z => z.SchoolName.Contains("Test"));

                try
                {
                    chatHeads = _chatHeadRepository.GetAll()
                      .Include(x => x.Receiver)
                      .Include(x => x.Sender)
                      .AsEnumerable()
                      .Where(x => (x.SenderId == userId.ToString() || x.ReceiverId == userId.ToString())
                      && (string.IsNullOrEmpty(searchString) || (userList.Any(u => (u.Id == x.SenderId || u.Id == x.ReceiverId) && ((u.FirstName.ToLower().Contains(searchString.ToLower())) || (u.LastName.ToLower().Contains(searchString.ToLower())) || ((u.FirstName.ToLower() + " " + u.LastName.ToLower()).Contains(searchString.ToLower())))) && x.ChatType == ChatType.Personal)))
                      .Skip((pageNumber - 1) * pageSize)
                      .Take(pageSize)
                      .ToList();

                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
            var first = chatHeads.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Personal).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                UnreadMessageCount = x.UnreadMessageCount,
                IsUserVerified=x.Sender.IsVarified,
                Gender=x.Sender.Gender
            }).ToList();

            users = users.Concat(first).ToList();

            var second = chatHeads.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Personal).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                IsUserVerified = x.Receiver.IsVarified,
                Gender = x.Receiver.Gender
            
                /*, UnreadMessageCount = x.UnreadMessageCount */
            }).ToList();

            users = users.Concat(second).ToList();

            var third = chatHeads.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.School).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                School = GetSchoolInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,

                UnreadMessageCount = x.UnreadMessageCount,
                IsVerified = GetSchoolInfo(x.ChatTypeId).IsVarified,
                IsUserVerified = GetUserInfo(x.SenderId).IsVarified

            }).ToList();

            var thirdSchools = third.Where(x => x.School.OwnerId != userId.ToString()).ToList();
            users = users.Concat(thirdSchools).ToList();

            var fourth = chatHeads.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.School).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                School = GetSchoolInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                IsVerified = GetSchoolInfo(x.ChatTypeId).IsVarified,
                IsUserVerified = GetUserInfo(x.ReceiverId).IsVarified
                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();

            var fourthSchools = fourth.Where(x => x.School.OwnerId != userId.ToString()).ToList();
            users = users.Concat(fourthSchools).ToList();

            var five = chatHeads.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Class).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Class = GetClassInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,

                UnreadMessageCount = x.UnreadMessageCount,
                IsUserVerified = GetUserInfo(x.SenderId).IsVarified
                //IsUserVerified = x.Sender.IsVarified
            }).ToList();
            var fiveClasses = five.Where(x => x.Class.CreatedById != userId.ToString()).ToList();
            users = users.Concat(fiveClasses).ToList();

            var six = chatHeads.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Class).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Class = GetClassInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                IsUserVerified = GetUserInfo(x.ReceiverId).IsVarified
                //IsUserVerified = x.Receiver.IsVarified

                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();
            var sixClasses = six.Where(x => x.Class.CreatedById != userId.ToString()).ToList();
            users = users.Concat(sixClasses).ToList();

            var seven = chatHeads.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Course).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Course = GetCourseInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,

                UnreadMessageCount = x.UnreadMessageCount,
                IsUserVerified = GetUserInfo(x.SenderId).IsVarified
                //IsUserVerified = x.Sender.IsVarified
            }).ToList();
            var sevenCourses = seven.Where(x => x.Course.CreatedById != userId.ToString()).ToList();
            users = users.Concat(sevenCourses).ToList();

            var eight = chatHeads.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Course).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Course = GetCourseInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                IsUserVerified = GetUserInfo(x.ReceiverId).IsVarified
                //IsUserVerified = x.Receiver.IsVarified

                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();
            var eightCourses = eight.Where(x => x.Course.CreatedById != userId.ToString()).ToList();
            users = users.Concat(eightCourses).ToList();

            var chatRepo = _chatMessageRepository.GetAll();
            var attachRepo = _attachmentRepository.GetAll();
            foreach (var chatUser in users)
            {
                if (chatHeads.First(x => x.Id == chatUser.ChatHeadId).SenderId == userId.ToString() && chatHeads.First(x => x.Id == chatUser.ChatHeadId).IsPinnedUser1)
                {
                    chatUser.IsPinned = true;
                }
                if (chatHeads.First(x => x.Id == chatUser.ChatHeadId).ReceiverId == userId.ToString() && chatHeads.First(x => x.Id == chatUser.ChatHeadId).IsPinnedUser2)
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
                firstUser.Chats = await GetParticularUserChat(firstUser.ChatHeadId, userId, firstUser.UserID, ChatType.Personal);
                await RemoveUnreadMessageCount(userId, firstUser.UserID, ChatType.Personal);

            }

            var firstSchool = users.Where(x => x.ChatType == ChatType.School).FirstOrDefault();
            if (firstSchool != null)
            {
                firstSchool.Chats = await GetParticularUserChat(firstSchool.ChatHeadId, userId, firstSchool.UserID, ChatType.School);
            }

            var firstClass = users.Where(x => x.ChatType == ChatType.Class).FirstOrDefault();
            if (firstClass != null)
            {
                firstClass.Chats = await GetParticularUserChat(firstClass.ChatHeadId, userId, firstClass.UserID, ChatType.Class);
            }

            var firstCourse = users.Where(x => x.ChatType == ChatType.Course).FirstOrDefault();
            if (firstCourse != null)
            {
                firstCourse.Chats = await GetParticularUserChat(firstCourse.ChatHeadId, userId, firstCourse.UserID, ChatType.Course);
            }
            return users.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        }


        public  async Task<ChatUsersViewModel> GetParticularChatHead(Guid userId, Guid receiverId, ChatType chatType, Guid? chatTypeId)
        {
            //List<ChatUsersViewModel> users = new List<ChatUsersViewModel>();
            try
            {
               
                var chatHead =  await _chatHeadRepository.GetAll().Include(x => x.Receiver).Include(x => x.Sender).Where(x => (x.SenderId == userId.ToString() && x.ReceiverId == receiverId.ToString() && x.ChatType == chatType && x.ChatTypeId==chatTypeId)).FirstOrDefaultAsync();
                ChatUsersViewModel chatUsersViewModel = new ChatUsersViewModel();
                if (chatHead != null)
                {
                     chatUsersViewModel = new ChatUsersViewModel
                    {
                    UserID = new Guid(chatHead.ReceiverId),
                    User2ID = new Guid(chatHead.SenderId),
                    LastMessage = chatHead.LastMessage,
                    ChatHeadId = chatHead.Id,
                    ChatType = chatHead.ChatType,
                    ChatTypeId = chatHead.ChatTypeId,
                    IsUserVerified = chatHead.Receiver.IsVarified,
                    Gender = chatHead.Receiver.Gender,
                    ProfileURL = chatHead.Receiver.Avatar,
                    UserName = chatHead.Receiver.FirstName + " " + chatHead.Receiver.LastName
                };
                
                }
                else
                {
                    chatHead = _chatHeadRepository.GetAll().Include(x => x.Receiver).Include(x => x.Sender).Where(x => (x.SenderId == receiverId.ToString() && x.ReceiverId == userId.ToString() && x.ChatType == chatType && x.ChatTypeId == chatTypeId)).FirstOrDefault();
                    
                    //if(chatHead == null) { return null; }
               
                    chatUsersViewModel = new ChatUsersViewModel
                    {
                    UserID = new Guid(chatHead.SenderId),
                    User2ID = new Guid(chatHead.ReceiverId),
                    LastMessage = chatHead.LastMessage,
                    ChatHeadId = chatHead.Id,
                    ChatType = chatHead.ChatType,
                    ChatTypeId = chatHead.ChatTypeId,
                    IsUserVerified = chatHead.Sender.IsVarified,
                    Gender = chatHead.Sender.Gender,
                    ProfileURL = chatHead.Sender.Avatar,
                    UserName = chatHead.Sender.FirstName + " " + chatHead.Sender.LastName
                     /*, UnreadMessageCount = x.UnreadMessageCount */
                    };
                }
                if (chatType == ChatType.School)
                {
                    chatUsersViewModel.School = GetSchoolInfo(chatUsersViewModel.ChatTypeId);
                    chatUsersViewModel.ProfileURL = chatUsersViewModel.School.Avatar;
                    chatUsersViewModel.UserName = chatUsersViewModel.School.SchoolName;
                    chatUsersViewModel.IsVerified = chatUsersViewModel.School.IsVarified;
                }
                else if (chatType == ChatType.Class)
                {
                    chatUsersViewModel.Class = GetClassInfo(chatUsersViewModel.ChatTypeId);
                    chatUsersViewModel.ProfileURL = chatUsersViewModel.Class.Avatar;
                    chatUsersViewModel.UserName = chatUsersViewModel.Class.ClassName;
                }
                else if (chatType == ChatType.Course)
                {
                    chatUsersViewModel.ProfileURL = chatUsersViewModel.Course.Avatar;
                    chatUsersViewModel.UserName = chatUsersViewModel.Course.CourseName;
                }
              
                return chatUsersViewModel;

            }
            catch(Exception ex)
            {
                return null;
            }
            return null;
        }

        public async Task<List<ChatUsersViewModel>> GetAllSchoolChatHeads(Guid userId, Guid schoolId, int pageNumber, string? searchString)
        {
            int pageSize = 10;
            List<ChatUsersViewModel> users = new List<ChatUsersViewModel>();
            var chatHeads = new List<ChatHead>();
            chatHeads = _chatHeadRepository.GetAll().Include(x => x.Receiver).Where(x => x.SenderId == userId.ToString() || x.ReceiverId == userId.ToString() && x.ChatType != ChatType.Personal).ToList();

            if (searchString != null)
            {
                var schoolList = new List<School>();
                var classList = new List<Class>();
                var courseList = new List<Course>();
                var userList = new List<User>();

                foreach (var chatHead in chatHeads)
                {
                    if (chatHead.ChatType == ChatType.School)
                    {
                        var school = _schoolRepository.GetById(chatHead.ChatTypeId);
                        schoolList.Add(school);
                    }
                }

                foreach (var chatHead in chatHeads)
                {
                    if (chatHead.ChatType == ChatType.Class)
                    {
                        var classes = _classRepository.GetById(chatHead.ChatTypeId);
                        classList.Add(classes);
                    }
                }

                foreach (var chatHead in chatHeads)
                {
                    if (chatHead.ChatType == ChatType.Course)
                    {
                        var course = _courseRepository.GetById(chatHead.ChatTypeId);
                        courseList.Add(course);
                    }
                }

    //            var userChatHeads = chatHeads.Where(x => x.ChatType == ChatType.Personal).ToList();
    //            foreach (var chatHead in userChatHeads)
    //            {
    //                if (chatHead.ChatType == ChatType.Personal)
    //                {
    //                    //var user = await _userRepository.GetAll().Where(x => x.Id == chatHead.SenderId || x.Id == chatHead.ReceiverId).FirstAsync();
    //                    var user = await _userRepository.GetAll()
    //.Where(x => (x.Id == chatHead.SenderId && chatHead.SenderId != userId.ToString() && chatHead.ChatType == ChatType.Personal) || (x.Id == chatHead.ReceiverId && chatHead.ReceiverId != userId.ToString() && chatHead.ChatType == ChatType.Personal))
    //.FirstAsync();

    //                    userList.Add(user);
    //                }
    //            }

                try
                {
                    chatHeads = _chatHeadRepository.GetAll()
                      .Include(x => x.Receiver)
                      .Include(x => x.Sender)
                      .AsEnumerable()
                      .Where(x => (x.SenderId == userId.ToString() || x.ReceiverId == userId.ToString()) && (x.SchoolId == schoolId || x.SchoolId == x.ChatTypeId)
                      && (string.IsNullOrEmpty(searchString) || (userList.Any(u => (u.Id == x.SenderId || u.Id == x.ReceiverId) && ((u.FirstName.ToLower().Contains(searchString.ToLower())) || (u.LastName.ToLower().Contains(searchString.ToLower())) || ((u.FirstName.ToLower() + " " + u.LastName.ToLower()).Contains(searchString.ToLower())))) && x.ChatType == ChatType.Personal)))
                      .Skip((pageNumber - 1) * pageSize)
                      .Take(pageSize)
                      .ToList();

                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
            //var first = chatHeads.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Personal).Select(x => new ChatUsersViewModel
            //{
            //    UserID = new Guid(x.SenderId),
            //    User2ID = new Guid(x.ReceiverId),
            //    LastMessage = x.LastMessage,
            //    ChatHeadId = x.Id,
            //    ChatType = x.ChatType,
            //    ChatTypeId = x.ChatTypeId,
            //    UnreadMessageCount = x.UnreadMessageCount
            //}).ToList();

            //users = users.Concat(first).ToList();

            //var second = chatHeads.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Personal).Select(x => new ChatUsersViewModel
            //{
            //    UserID = new Guid(x.ReceiverId),
            //    User2ID = new Guid(x.SenderId),
            //    LastMessage = x.LastMessage,
            //    ChatHeadId = x.Id,
            //    ChatType = x.ChatType,
            //    ChatTypeId = x.ChatTypeId,
            //    /*, UnreadMessageCount = x.UnreadMessageCount */
            //}).ToList();

            //users = users.Concat(second).ToList();




            var third = chatHeads.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.School && x.ChatTypeId == schoolId).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                School = GetSchoolInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                UnreadMessageCount = x.UnreadMessageCount,
                IsVerified = GetSchoolInfo(x.ChatTypeId).IsVarified,
                IsUserVerified = GetUserInfo(x.SenderId).IsVarified,
                Gender=x.Sender.Gender,
                SchoolId = GetSchoolInfo(x.ChatTypeId).SchoolId
            }).ToList();
            var thirdSchools = third.Where(x => x.School.OwnerId == userId.ToString()).ToList();
            users = users.Concat(thirdSchools).ToList();

            var fourth = chatHeads.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.School && x.ChatTypeId == schoolId).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                School = GetSchoolInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                IsVerified = GetSchoolInfo(x.ChatTypeId).IsVarified,
                IsUserVerified = GetUserInfo(x.ReceiverId).IsVarified,
                Gender=x.Receiver.Gender,
                SchoolId = GetSchoolInfo(x.ChatTypeId).SchoolId
                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();
            var fourthSchools = fourth.Where(x => x.School.OwnerId == userId.ToString()).ToList();
            users = users.Concat(fourthSchools).ToList();



            var five = chatHeads.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Class && x.SchoolId == schoolId).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Class = GetClassInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                UnreadMessageCount = x.UnreadMessageCount,
                IsUserVerified = GetUserInfo(x.SenderId).IsVarified,
                Gender = x.Sender.Gender,
                SchoolId = GetClassInfo(x.ChatTypeId).SchoolId
            }).ToList();
            var fifthClassess = five.Where(x => x.Class.CreatedById == userId.ToString()).ToList();
            users = users.Concat(fifthClassess).ToList();

            var six = chatHeads.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Class && x.SchoolId == schoolId).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Class = GetClassInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                IsUserVerified = GetUserInfo(x.ReceiverId).IsVarified,
                Gender = x.Receiver.Gender,
                SchoolId = GetClassInfo(x.ChatTypeId).SchoolId

                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();
            var sixthClassess = six.Where(x => x.Class.CreatedById == userId.ToString()).ToList();
            users = users.Concat(sixthClassess).ToList();

            var seven = chatHeads.Where(x => x.ReceiverId == userId.ToString() && x.ChatType == ChatType.Course && x.SchoolId == schoolId).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.SenderId),
                User2ID = new Guid(x.ReceiverId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Course = GetCourseInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                IsUserVerified = GetUserInfo(x.SenderId).IsVarified,
                UnreadMessageCount = x.UnreadMessageCount,
                Gender = x.Sender.Gender,
                SchoolId = GetCourseInfo(x.ChatTypeId).SchoolId
            }).ToList();
            var seventhCourses = seven.Where(x => x.Course.CreatedById == userId.ToString()).ToList();
            users = users.Concat(seventhCourses).ToList();

            var eight = chatHeads.Where(x => x.SenderId == userId.ToString() && x.ChatType == ChatType.Course && x.SchoolId == schoolId).Select(x => new ChatUsersViewModel
            {
                UserID = new Guid(x.ReceiverId),
                User2ID = new Guid(x.SenderId),
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id,
                Course = GetCourseInfo(x.ChatTypeId),
                ChatType = x.ChatType,
                ChatTypeId = x.ChatTypeId,
                IsUserVerified = GetUserInfo(x.ReceiverId).IsVarified,
                Gender = x.Receiver.Gender,
                SchoolId = GetCourseInfo(x.ChatTypeId).SchoolId
                //UnreadMessageCount = x.UnreadMessageCount
            }).ToList();
            var eightCourses = eight.Where(x => x.Course.CreatedById == userId.ToString()).ToList();
            users = users.Concat(eightCourses).ToList();

            var chatRepo = _chatMessageRepository.GetAll();
            var attachRepo = _attachmentRepository.GetAll();
            foreach (var chatUser in users)
            {
                if (chatHeads.First(x => x.Id == chatUser.ChatHeadId).SenderId == userId.ToString() && chatHeads.First(x => x.Id == chatUser.ChatHeadId).IsPinnedUser1)
                {
                    chatUser.IsPinned = true;
                }
                if (chatHeads.First(x => x.Id == chatUser.ChatHeadId).ReceiverId == userId.ToString() && chatHeads.First(x => x.Id == chatUser.ChatHeadId).IsPinnedUser2)
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

            //var firstUser = users.Where(x => x.ChatType == ChatType.Personal).FirstOrDefault();
            //if (firstUser != null)
            //{
            //    firstUser.Chats = await GetParticularUserChat(firstUser.ChatHeadId, userId, firstUser.UserID, ChatType.Personal);
            //    await RemoveUnreadMessageCount(userId, firstUser.UserID, ChatType.Personal);

            //}

            var firstSchool = users.Where(x => x.ChatType == ChatType.School).FirstOrDefault();
            if (firstSchool != null)
            {
                firstSchool.Chats = await GetParticularUserChat(firstSchool.ChatHeadId, userId, firstSchool.UserID, ChatType.School);
            }

            var firstClass = users.Where(x => x.ChatType == ChatType.Class).FirstOrDefault();
            if (firstClass != null)
            {
                firstClass.Chats = await GetParticularUserChat(firstClass.ChatHeadId, userId, firstClass.UserID, ChatType.Class);
            }

            var firstCourse = users.Where(x => x.ChatType == ChatType.Course).FirstOrDefault();
            if (firstCourse != null)
            {
                firstCourse.Chats = await GetParticularUserChat(firstCourse.ChatHeadId, userId, firstCourse.UserID, ChatType.Course);
            }
            return users.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        }

        public UserDetailsViewModel GetUserInfo(string? userId)
        {
            var user = _userRepository.GetById(userId);
            return new UserDetailsViewModel { Id = user.Id, FirstName = user.FirstName, LastName = user.LastName, IsVarified = user.IsVarified };
        }

        public SchoolUpdateViewModel GetSchoolInfo(Guid? schoolId)
        {
            var school = _schoolRepository.GetById(schoolId);
            return new SchoolUpdateViewModel { SchoolId = school.SchoolId, SchoolName = school.SchoolName, Avatar = school.Avatar, OwnerId = school.CreatedById ,IsVarified=school.IsVarified };
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

        public async Task<IEnumerable<ParticularChat>> GetParticularUserChat(Guid ChatHeadId, Guid SenderId, Guid ReceiverId, ChatType chatType, int pageSize = 7, int pageNumber = 1)
        {
            //const int MinimumPageSize = 10;
            var attachRepo = _attachmentRepository.GetAll();
            var chatRepo = _chatMessageRepository.GetAll().Where(x => !x.IsDeleted).Include(x => x.ChatHead).Where(x => (x.SenderId == SenderId && x.ReceiverId == ReceiverId && x.ChatHead.ChatType == chatType && x.ChatHeadId == ChatHeadId) || (x.SenderId == ReceiverId && x.ReceiverId == SenderId && x.ChatHead.ChatType == chatType && x.ChatHeadId == ChatHeadId)).OrderByDescending(x => x.CreatedOn).Skip((pageNumber - 1) * pageSize).Take(pageSize);

            //  if (chatrepo.count() < minimumpagesize)
            //chatRepo = chatRepo.OrderByDescending(x => x.CreatedOn);
            //else
            //chatRepo = chatRepo.Skip((pageNumber - 1) * pageSize).Take(pageSize);


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
                partChat.Id = item.Id;
                partChat.IsForwarded = item.IsForwarded;
                partChat.ChatHeadId = item.ChatHeadId;
                // here we will add reply message content
                var replyTextMessage = _chatMessageRepository.GetById(item.ReplyMessageId);
                if (replyTextMessage != null)
                {
                    partChat.ReplyChatId = replyTextMessage.Id;
                    partChat.ReplyChatContent = replyTextMessage.Message;
                    partChat.ReplyMessageType = (int)ReplyMessageTypeEnum.Text;
                }
                else
                {
                    var replyAttachmentMessage = _attachmentRepository.GetById(item.ReplyMessageId);
                    if (replyAttachmentMessage != null)
                    {
                        partChat.ReplyChatId = replyAttachmentMessage.Id;
                        partChat.ReplyChatContent = replyAttachmentMessage.FileURL;
                        partChat.ReplyMessageType = replyAttachmentMessage.FileType == Data.Entity.Chat.FileTypeEnum.Image ? (int)ReplyMessageTypeEnum.Image : replyAttachmentMessage.FileType == Data.Entity.Chat.FileTypeEnum.Video ? (int)ReplyMessageTypeEnum.Video : replyAttachmentMessage.FileType == Data.Entity.Chat.FileTypeEnum.Attachment ? (int)ReplyMessageTypeEnum.Attachment : null;
                        partChat.FileName = replyAttachmentMessage.FileName;
                    }
                }
                //}
                if (item.SenderId == SenderId)
                    partChat.SendByMe = true;

                partChat.SendByMe = item.SenderId == SenderId ? true : false;

                chatList.Add(partChat);
            }
            chatList.Reverse();
            return chatList;
            //return chatList.OrderBy(x => x.Time);
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
            var result = await _chatHeadRepository.GetAll().Where(x => /*(x.SenderId == SenderId.ToString() && x.ReceiverId == ReceiverId.ToString() && x.ChatType == chatType) || (*/x.SenderId == ReceiverId.ToString() && x.ReceiverId == SenderId.ToString() && x.ChatType == chatType )/*)*/.FirstOrDefaultAsync();
            if (result != null)
            {
                if (result.UnreadMessageCount != 0)
                {
                    result.UnreadMessageCount = 0;
                    _chatHeadRepository.Update(result);
                    _chatHeadRepository.Save();
                }
            }
        }

        public async Task RemoveUnreadMessageCount(Guid SenderId, Guid ReceiverId, ChatType chatType, Guid chatHeadId)
        {
            var result = await _chatHeadRepository.GetAll().Where(x => /*(x.SenderId == SenderId.ToString() && x.ReceiverId == ReceiverId.ToString() && x.ChatType == chatType) || (*/x.SenderId == ReceiverId.ToString() && x.ReceiverId == SenderId.ToString() && x.ChatType == chatType && x.Id == chatHeadId)/*)*/.FirstOrDefaultAsync();
            if (result != null)
            {
                if (result.UnreadMessageCount != 0)
                {
                    result.UnreadMessageCount = 0;
                    _chatHeadRepository.Update(result);
                    _chatHeadRepository.Save();
                }
            }
        }


        public async Task<CommentViewModel> AddComment(CommentViewModel chatViewModel)
        {
            var comment = new Comment
            {
                UserId = chatViewModel.UserId,
                GroupName = chatViewModel.GroupName,
                Content = chatViewModel.Content,
                CreatedOn = DateTime.UtcNow
            };

            _commentRepository.Insert(comment);
            _commentRepository.Save();
            var user = await _commentRepository.GetAll().Include(x => x.User).Where(x => x.Id == comment.Id).Select(x => x.User).FirstAsync();
            chatViewModel.User = _mapper.Map<UserDetailsViewModel>(user);
            chatViewModel.Id = comment.Id;
            chatViewModel.UserId = user.Id;
            chatViewModel.UserName = user.FirstName + " " + user.LastName;
            chatViewModel.CreatedOn = DateTime.SpecifyKind(comment.CreatedOn, DateTimeKind.Unspecified);
            return chatViewModel;

        }

        public async Task<List<CommentViewModel>> GetComments(Guid id, string userid, int pageNumber)
        {
            int pageSize = 15;
            var comments = await _commentRepository.GetAll().Include(x => x.User).Where(x => x.GroupName == id + "_group").OrderByDescending(x => x.CreatedOn).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            var response = _mapper.Map<List<CommentViewModel>>(comments);
            var CommentLikes = await _commentLikeRepository.GetAll().ToListAsync();
            foreach (var item in response)
            {
                item.UserId = item.User.Id;
                item.UserAvatar = item.User.Avatar;
                item.UserName = item.User.FirstName + " " + item.User.LastName;
                if (CommentLikes.Any(x => x.CommentId == item.Id && x.UserId == userid))
                {
                    item.isCommentLikedByCurrentUser = true;
                }
            }
            response.Reverse();
            return response;



        }

        public async Task<CommentLikeUnlikeViiewModel> LikeUnlikeComment(CommentLikeUnlikeViiewModel model)
        {

            var commentLike = await _commentLikeRepository.GetAll().Where(x => x.CommentId == new Guid(model.CommentId) && x.UserId == model.UserId).FirstOrDefaultAsync();

            if (commentLike != null)
            {
                _commentLikeRepository.Delete(commentLike.Id);
                _commentLikeRepository.Save();

                Comment comment = _commentRepository.GetById(new Guid(model.CommentId));
                comment.LikeCount = comment.LikeCount - 1;
                _commentRepository.Update(comment);
                _commentRepository.Save();
                return model;

            }

            else
            {
                var commentLikes = new CommentLike
                {
                    UserId = model.UserId,
                    CommentId = new Guid(model.CommentId)
                };

                _commentLikeRepository.Insert(commentLikes);
                _commentLikeRepository.Save();
                try
                {
                    Comment comment = _commentRepository.GetById(new Guid(model.CommentId));
                    comment.LikeCount = comment.LikeCount + 1;
                    _commentRepository.Update(comment);
                    _commentRepository.Save();
                    return model;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
            return null;
        }

        public async Task<bool?> DeleteCommentById(CommentLikeUnlikeViiewModel model)
        {
            var commentLike = await _commentRepository.GetAll()
                                                      .FirstOrDefaultAsync(x => x.Id == Guid.Parse(model.CommentId) && x.UserId == model.UserId);
            if (commentLike != null)
            {
                try
                {
                    _commentRepository.Delete(commentLike.Id);
                    _commentRepository.Save();
                }
                catch (Exception ex)
                {
                    // Handle exception here. It's a good practice to at least log the exception.
                }

                return true;
            }
            return false;
        }




    }
}
