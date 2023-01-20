using LMS.ChatHub;
using LMS.Common.ViewModels.Chat;
using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using LMS.Services.Chat;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    private readonly UserManager<User> _userManager;
    private readonly IChatService _chatService;
    public ChatHub(UserManager<User> userManager, IChatService chatService)
    {
        _userManager = userManager;
        _chatService = chatService;
    }

    static Dictionary<string, string> UserIDConnectionID = new Dictionary<string, string>();

    private async Task<User> GetUser()
    {
        var user = await _userManager.FindByIdAsync(UserIDConnectionID.FindFirstKeyByValue(Context.ConnectionId));
        return user;
    }
    public override Task OnConnectedAsync()
    {
        //ContectedUsers.ContectedIds.Add(Context.ConnectionId);
        //var user =  await GetUser();
        var name = Context.GetHttpContext()?.Request.Query["username"];
        Clients.All.SendAsync("UserCount", UserIDConnectionID.Count + 1);
        //Clients.Client(Context.ConnectionId).SendAsync("Conn", user.NormalizedUserName + " " + user.City);

        return base.OnConnectedAsync();
    }
    public override Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
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
       

        //var a = UserIDConnectionID[chatMessageViewModel.Receiver.ToString()];
        var reposnseMessage = _chatService.AddChatMessage(chatMessageViewModel);
        //if (a is not null)
        //    await Clients.Client(a).SendAsync("ReceiveMessage", reposnseMessage);
        
        
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

    public Task SendMessageToGroup(string groupname, string sender, string message) => 
        //here we will store the recieverid for anyone.
      Clients.Group(groupname).SendAsync("ReceiveMessage", sender, message);

    public void LikedMethod(string likedByUserID)
    {
        Clients.Client(UserIDConnectionID[likedByUserID]).SendAsync("NotifyLike");
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