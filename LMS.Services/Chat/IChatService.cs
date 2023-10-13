using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity.Chat;
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
        Task<ChatHeadViewModel> GetChatHead(Guid sender, Guid receiver, ChatType chatType, Guid? chatTypeId);
        Task<List<ChatUsersViewModel>> GetAllChatHeadForLoggedInUser(Guid user, int pageNumber, string? searchString);
        Task<ChatUsersViewModel> GetParticularChatHead(Guid userId, Guid receiverId, ChatType chatType, Guid? chatTypeId);
        Task<List<ChatUsersViewModel>> GetAllSchoolChatHeads(Guid user, Guid schoolId, int pageNumber, string? searchString);
        Task<List<ChatHeadViewModel>> GetChatHeadsForReceiver(string receiver);
        Task<List<ChatAttachmentResponse>> SaveChatAttachments(SaveChatAttachmentViewModel model);
        Task<IEnumerable<ParticularChat>> GetParticularUserChat(Guid ChatHeadId, Guid SenderId, Guid ReceiverId,ChatType chatType, int pageSize, int pageNumber);
        Task<bool> SetParticularUserPinned(Guid senderId, Guid receiverId,ChatType chatType);
        Task RemoveUnreadMessageCount(Guid senderId, Guid receiverId,ChatType chatType);
        Task<CommentViewModel> AddComment(CommentViewModel model);
        Task<List<CommentViewModel>> GetComments(Guid id,string userId, int pageNumber);
        Task<CommentLikeUnlikeViiewModel> LikeUnlikeComment(CommentLikeUnlikeViiewModel model);

        Task<bool?> DeleteCommentById(CommentLikeUnlikeViiewModel model);

    }
}
