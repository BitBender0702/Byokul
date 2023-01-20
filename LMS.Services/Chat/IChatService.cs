using LMS.Common.ViewModels.Chat;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Chat
{
    public interface IChatService
    {
        Task<ChatMessageViewModel> AddChatMessage(ChatMessageViewModel chatViewModel);
        Task<ChatMessageViewModel> GetChatMessageForChatHead(Guid chatHeadId);
        Task<Guid> AddChatHead(ChatHeadViewModel chatViewModel);
        Task UpdateChatHead(ChatMessageViewModel chatheadViewModel);
        Task<ChatHeadViewModel> GetChatHead(Guid sender, Guid receiver);
        Task<IEnumerable<ChatUsersViewModel>> GetAllChatHeadForLoggedInUser(Guid user);
        Task<List<ChatHeadViewModel>> GetChatHeadsForReceiver(string receiver);
        Task<ChatAttachmentResponse> SaveChatAttachments(SaveChatAttachmentViewModel model);
        Task<IEnumerable<ParticularChat>> GetParticularUserChat(Guid SenderId, Guid ReceiverId, int pageSize, int pageNumber);
        Task<int> SetParticularUserPinned(Guid senderId, Guid receiverId);
    }
}
