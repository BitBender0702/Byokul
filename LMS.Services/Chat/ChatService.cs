using AutoMapper;
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Class;
using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using LMS.DataAccess.GenericRepository;
using LMS.DataAccess.Repository;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;
        private readonly IBlobService _blobService;
        public ChatService(IGenericRepository<ChatMessage> repository, IMapper mapper, IGenericRepository<ChatHead> chatHeadRepository, IBlobService blobService, IGenericRepository<Attachment> attachmentRepo, UserManager<User> userManager)
        {
            _chatMessageRepository = repository;
            _chatHeadRepository = chatHeadRepository;
            _mapper = mapper;
            _blobService = blobService;
            _attachmentRepository = attachmentRepo;
            _userManager = userManager;
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
                    Receiver = chatViewModel.Receiver,
                    Sender = chatViewModel.Sender,
                    LastMessage = chatViewModel.Message
                });
            }
            else
            {
                try
                {

                    await UpdateChatHead(chatViewModel);
                }
                catch (Exception ex)
                {

                    throw ex;
                }
            }
            var chatModel = _mapper.Map<ChatMessage>(chatViewModel);
            chatModel.Id = Guid.NewGuid();
            chatModel.CreatedOn = DateTime.Now;
            chatModel.IsRead = false;
            chatModel.SenderId = chatViewModel.Sender;
            chatModel.ReceiverId = chatViewModel.Receiver;
            //chatModel.AttachmentURLs = await saveAttachmentsAndReturnURL(chatViewModel.Attachments);

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
            chatHead.User1 = chatViewModel.Sender;
            chatHead.User2 = chatViewModel.Receiver;
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
            //var existingChatHead =   _chatHeadRepository.GetById(chatheadViewModel.Id);
            var existingChatHead = _chatHeadRepository.GetAll().Where(x => x.Id == chatheadViewModel.ChatHeadId).FirstOrDefault();
            if (existingChatHead is null)
            {
                throw new ArgumentException();
            }
            existingChatHead.LastMessage = chatheadViewModel.Message;
            existingChatHead.UnreadMessageCount += 1;
            _chatHeadRepository.Update(existingChatHead);

        }

        public Task<ChatMessageViewModel> GetChatMessageForChatHead(Guid chatHeadId)
        {
            throw new NotImplementedException();
        }

        public async Task<ChatHeadViewModel> GetChatHead(Guid sender, Guid receiver)
        {
            ChatHead res;
            res = _chatHeadRepository.GetFirstOrDefaultBy(x => x.User1 == sender && x.User2 == receiver);

            if (res is null)
                res = _chatHeadRepository.GetFirstOrDefaultBy(x => x.User1 == receiver && x.User2 == sender);

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

        public async Task<ChatAttachmentResponse> SaveChatAttachments(SaveChatAttachmentViewModel model)
        {
            var containerName = "chatattachments";
            var response = new ChatAttachmentResponse();
            response.FileUrl = await _blobService.UploadFileAsync(model.File, containerName);
            response.FileName = model.File.FileName;
            response.FileType = Convert.ToInt16(model.FileType);
            return response;
        }

        public async Task<IEnumerable<ChatUsersViewModel>> GetAllChatHeadForLoggedInUser(Guid userId)
        {

            IEnumerable<ChatUsersViewModel> users = new List<ChatUsersViewModel>();
            var res = _chatHeadRepository.GetAll().Where(x => x.User1 == userId || x.User2 == userId).ToList();
            var IsPinnedUser1Object = res.FirstOrDefault(x => x.IsPinnedUser1);
            var IsPinnedUser2Object = res.FirstOrDefault(x => x.IsPinnedUser2);
            Guid IsPinnedReceiverId = default;

            if (IsPinnedUser1Object != null)
                if (IsPinnedUser1Object.IsPinnedUser1 && IsPinnedUser1Object.User1 == userId)
                    IsPinnedReceiverId = IsPinnedUser1Object.User2;


            if (IsPinnedUser2Object != null)
                if (IsPinnedUser2Object.IsPinnedUser2 && IsPinnedUser2Object.User2 == userId)
                    IsPinnedReceiverId = IsPinnedUser2Object.User1;



            var first = res.Where(x => x.User2 == userId).Select(x => new ChatUsersViewModel
            {
                UserID = x.User1,
                LastMessage = x.LastMessage,
                ChatHeadId = x.Id
            }).ToList();

            users = users.Concat(first).ToList();

            var second = res.Where(x => x.User1 == userId).Select(x => new ChatUsersViewModel { UserID = x.User2, LastMessage = x.LastMessage, ChatHeadId = x.Id }).ToList();

            users = users.Concat(second).ToList();

            var chatRepo = _chatMessageRepository.GetAll();
            var attachRepo = _attachmentRepository.GetAll();
            foreach (var chatUser in users)
            {

                var LastChatObject = chatRepo.Where(x => x.ChatHeadId == chatUser.ChatHeadId).OrderByDescending(x => x.CreatedOn).First();
                var chatId = LastChatObject.Id;
                var receiverUser = await _userManager.FindByIdAsync(LastChatObject.ReceiverId.ToString());

                if (chatUser.LastMessage is null)
                {
                    //var messages = _chatMessageRepository.GetAll().Where(y => users.Select(x => x.ChatHeadId).ToList().Contains(y.Id)).GroupBy(x => x.ChatHeadId).Select(z => new
                    //   ChatUsersViewModel
                    //{
                    //    ChatHeadId = z.Key,
                    //    LastMessage = z.OrderByDescending(a => a.CreatedOn).FirstOrDefault().Message
                    //}).ToList();
                    chatUser.FileName = attachRepo.Where(x => x.ChatMessageId == chatId).First().FileName;
                }
                chatUser.Time = LastChatObject.CreatedOn;
                chatUser.ProfileURL = receiverUser.Avatar;
                chatUser.UserName = receiverUser.FirstName + " " + receiverUser.LastName;
            }


            return users.OrderByDescending(x => x.UserID == IsPinnedReceiverId).ThenBy(x => x.Time);
        }

        public async Task<IEnumerable<ParticularChat>> GetParticularUserChat(Guid SenderId, Guid ReceiverId, int pageSize, int pageNumber)
        {
            var attachRepo = _attachmentRepository.GetAll();
            var chatRepo = _chatMessageRepository.GetAll().Where(x => !x.IsDeleted).Where(x => (x.SenderId == SenderId && x.ReceiverId == ReceiverId) || (x.SenderId == ReceiverId && x.ReceiverId == SenderId)).OrderByDescending(x => x.CreatedOn).Skip((pageNumber - 1) * pageSize).Take(pageSize);

            List<ParticularChat> chatList = new List<ParticularChat>();

            foreach (var item in chatRepo)
            {
                var partChat = new ParticularChat { Time = item.CreatedOn };

                if (item.Message is null)
                {
                    var AttachRepoObject = attachRepo.Where(x => x.ChatMessageId == item.Id).First();

                    partChat.FileName = AttachRepoObject.FileName;
                    partChat.FileUrl = AttachRepoObject.FileURL;
                }
                else
                {
                    partChat.Text = item.Message;
                }
                if (item.SenderId == SenderId)
                    partChat.SendByMe = true;

                partChat.SendByMe = item.SenderId == SenderId ? true : false;

                chatList.Add(partChat);
            }
            return chatList.OrderBy(x=>x.Time);
        }
        public async Task<int> SetParticularUserPinned(Guid SenderId, Guid ReceiverId)
        {

            var chatHeadObject=_chatHeadRepository.GetAll().Where(x => (x.User1 == SenderId && x.User2 == ReceiverId)|| (x.User1 == ReceiverId && x.User2 == SenderId)).First();

            string SenderCol=chatHeadObject.User1 == SenderId ? "User1" : "User2";

            if (SenderCol == "User1")
                chatHeadObject.IsPinnedUser1 = chatHeadObject.IsPinnedUser1 == false ? true : false;
            else
                chatHeadObject.IsPinnedUser2 = chatHeadObject.IsPinnedUser2 == false ? true : false;

            _chatHeadRepository.Save();
            return 200;
        }
        
    }
}
