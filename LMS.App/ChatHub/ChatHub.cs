﻿using LMS.ChatHub;
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using LMS.Services.Chat;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly UserManager<User> _userManager;
    private readonly IChatService _chatService;
    private readonly IHttpContextAccessor _contextAccessor;
    public ChatHub(UserManager<User> userManager, IChatService chatService, IHttpContextAccessor contextAccessor)
    {
        _userManager = userManager;
        _chatService = chatService;
        _contextAccessor = contextAccessor;
    }

    static Dictionary<string, string> UserIDConnectionID = new Dictionary<string, string>();

    private async Task<User> GetUser()
    {
        var user = await _userManager.FindByIdAsync(UserIDConnectionID.FindFirstKeyByValue(Context.ConnectionId));
        return user;
    }
    public override Task OnConnectedAsync()
    {
        var userId = Context.User?.Claims?.FirstOrDefault(x => x.Type == "jti").Value;
        if (!string.IsNullOrEmpty(userId))
        {
            if (UserIDConnectionID.ContainsKey(userId))
                UserIDConnectionID[userId] = Context.ConnectionId;
            else
                UserIDConnectionID.Add(userId, Context.ConnectionId);
        }

        Clients.All.SendAsync("UserCount", UserIDConnectionID.Count + 1);
        return base.OnConnectedAsync();
    }
    public override Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var userId = UserIDConnectionID.FindFirstKeyByValue(Context.ConnectionId);
            Clients.All.SendAsync("DisconnectedUser", userId);
            UserIDConnectionID.Remove(UserIDConnectionID.FindFirstKeyByValue(Context.ConnectionId));

        }
        catch (Exception)
        {

            return base.OnDisconnectedAsync(exception);
        }
        //ContectedUsers.ContectedIds.Remove(UserIDConnectionID.FindFirstKeyByValue(Context.ConnectionId));
        //Clients.All.SendAsync("UserCount", UserIDConnectionID.Count);
        return base.OnDisconnectedAsync(exception);
    }
    public Task SendMessage(string user, string message) => Clients.All.SendAsync("ReceiveMessage", user, message);
    public async Task SendToUser(ChatMessageViewModel chatMessageViewModel)
    {


        var reposnseMessage = await _chatService.AddChatMessage(chatMessageViewModel);
        var a = UserIDConnectionID[chatMessageViewModel.Receiver.ToString()];
        if (a is not null)
            await Clients.Client(a).SendAsync("ReceiveMessage", chatMessageViewModel, "test");


    }

    public string GetConnectionId(string UserID)
   {
        if (UserIDConnectionID.ContainsKey(UserID))
            UserIDConnectionID[UserID] = Context.ConnectionId;
        else
            UserIDConnectionID.Add(UserID, Context.ConnectionId);
        return Context.ConnectionId;
    }

    public Task JoinGroup(string group) => Groups.AddToGroupAsync(Context.ConnectionId, group);

    public async Task SendMessageToGroup(CommentViewModel model)
    {
        var reposnseMessage = await _chatService.AddComment(model);
        var currentUserConnectionId = UserIDConnectionID[model.UserId.ToString()];
        await Clients.GroupExcept(model.GroupName, currentUserConnectionId).SendAsync("ReceiveMessageFromGroup", reposnseMessage);
    }

    public void LikedMethod(string likedByUserID)
    {
        Clients.Client(UserIDConnectionID[likedByUserID]).SendAsync("NotifyLike");
    }

    public async Task NotifyCommentLike(string commentId,int likeCount,bool isLike,string groupName)
    {
        await Clients.Group(groupName).SendAsync("NotifyCommentLikeToReceiver", commentId, likeCount, isLike);
    }


}

public static class Extensions
{
    public static K FindFirstKeyByValue<K, V>(this Dictionary<K, V> dict, V val)
    {
        return dict.FirstOrDefault(entry =>
            EqualityComparer<V>.Default.Equals(entry.Value, val)).Key;
    }
}