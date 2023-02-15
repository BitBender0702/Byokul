using LMS.Data.Entity;
using LMS.Services.Common;
using LMS.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using LMS.Services.Chat;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Authorization;
using LMS.Data.Entity.Chat;
using LMS.Common.ViewModels.Post;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("chats")]
    public class ChatController : BaseController
    {

        private readonly IChatService _chatService;
        private readonly IBlobService _blobService;
        private readonly UserManager<User> _userManager;
        private string ContainerName = "chatattachments";

        public ChatController(IChatService chatService, IBlobService blobService, UserManager<User> userManager)
        {
            _chatService = chatService;
            _blobService = blobService;
            _userManager = userManager;
        }

        [Route("getChatHead")]
        [HttpGet]
        public async Task<IActionResult> GetChatHead(Guid senderId, Guid receiverId,ChatType chatType)
        {
            var response = await _chatService.GetChatHead(senderId, receiverId, chatType);
            return Ok(response);
        }

        [Route("getAllChatUsers")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers(Guid senderId)
        {
            var response = await _chatService.GetAllChatHeadForLoggedInUser(senderId);
            return Ok(response);
        }

        [Route("getUsersChat")]
        [HttpGet]
        public async Task<IActionResult> GetUsersChat(Guid senderId, Guid receiverId,ChatType chatType, int pageSize=10, int pageNumber=1)
        {
            await _chatService.RemoveUnreadMessageCount(senderId, receiverId, chatType);
            var response = await _chatService.GetParticularUserChat(senderId, receiverId,chatType,  pageSize,  pageNumber);
            return Ok(response);
        }

        [Route("setUserPinned")]
        [HttpPost]
        public async Task<IActionResult> SetUserPinned(Guid senderId, Guid receiverId,ChatType chatType)
        {
            var response = await _chatService.SetParticularUserPinned(senderId, receiverId, chatType);
            return Ok(response);
        }

        [Route("removeChatAttachment")]
        [HttpPost]
        public async Task<IActionResult> RemoveChatAttachment(string fileUrl)
        {
            var response = await _blobService.DeleteFile(fileUrl, ContainerName);
            return Ok(response);
        }

        [Route("removeUnreadMessageCount")]
        [HttpPost]
        public async Task<IActionResult> RemoveUnreadMessageCount(Guid senderId, Guid receiverId, ChatType chatType)
        {
            await _chatService.RemoveUnreadMessageCount(senderId, receiverId, chatType);
            return Ok();
        }

        [Route("getComments")]
        [HttpGet]
        public async Task<IActionResult> GetComments(Guid id, int pageNumber)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _chatService.GetComments(id, userId, pageNumber);
            return Ok(response);
        }

        [Route("addComment")]
        [HttpPost]
        public async Task<IActionResult> AddComment([FromBody]CommentViewModel model)
        {
            var response = await _chatService.AddComment( model);
            return Ok(response);
        }
    }
}
