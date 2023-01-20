using LMS.Data.Entity;
using LMS.Services.Common;
using LMS.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using LMS.Services.Chat;

namespace LMS.App.Controllers
{
    [Route("chats")]
    public class ChatController : BaseController
    {

        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [Route("getChatHead")]
        [HttpGet]
        public async Task<IActionResult> GetChatHead(Guid senderId, Guid receiverId)
        {
            var response = await _chatService.GetChatHead(senderId, receiverId);
            return Ok(response);
        }

        [Route("getAllUsers")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers(Guid senderId)
        {
            var response = await _chatService.GetAllChatHeadForLoggedInUser(senderId);
            return Ok(response);
        }

        [Route("getUsersChat")]
        [HttpGet]
        public async Task<IActionResult> GetUsersChat(Guid senderId, Guid receiverId, int pageSize, int pageNumber)
        {
            var response = await _chatService.GetParticularUserChat(senderId, receiverId,  pageSize,  pageNumber);
            return Ok(response);
        }

        [Route("setUserPinned")]
        [HttpPost]
        public async Task<IActionResult> SetUserPinned(Guid senderId, Guid receiverId)
        {
            var response = await _chatService.SetParticularUserPinned(senderId, receiverId);
            return Ok(response);
        }
    }
}
