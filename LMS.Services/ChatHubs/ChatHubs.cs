using iText.Html2pdf.Attach;
using LMS.Common.Enums;
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Notification;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using LMS.DataAccess.Repository;
using LMS.Services;
using LMS.Services.Chat;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHubs : Hub
{
    private readonly UserManager<User> _userManager;
    private readonly IChatService _chatService;
    private readonly INotificationService _notificationService;
    private IGenericRepository<UserFollower> _userFollowerRepository;
    private IGenericRepository<User> _userRepository;
    private IGenericRepository<View> _viewRepository;
    private IGenericRepository<School> _schoolRepository;
    private IGenericRepository<Class> _classRepository;
    private IGenericRepository<Teacher> _teacherRepository;


    private IGenericRepository<Course> _courseRepository;

    private readonly IPostService _postService;



    public ChatHubs(UserManager<User> userManager, IGenericRepository<Course> courseRepository, IPostService postService, IChatService chatService, IGenericRepository<View> viewRepository, INotificationService notificationService, IGenericRepository<UserFollower> userFollowerRepository, IGenericRepository<User> userRepository, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Teacher> teacherRepository)
    {
        _userManager = userManager;
        _chatService = chatService;
        _viewRepository = viewRepository;
        _notificationService = notificationService;
        _userFollowerRepository = userFollowerRepository;
        _userRepository = userRepository;
        _schoolRepository = schoolRepository;
        _classRepository = classRepository;
        _teacherRepository = teacherRepository;
        _courseRepository = courseRepository;
        _postService = postService;
    }

    static Dictionary<string, string> UserIDConnectionID = new Dictionary<string, string>();

    private async Task<User> GetUser()
    {
        var user = await _userManager.FindByIdAsync(UserIDConnectionID.FindFirstKeyByValue2(Context.ConnectionId));
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
            var userId = UserIDConnectionID.FindFirstKeyByValue2(Context.ConnectionId);
            Clients.All.SendAsync("DisconnectedUser", userId);
            UserIDConnectionID.Remove(UserIDConnectionID.FindFirstKeyByValue2(Context.ConnectionId));

        }
        catch (Exception)
        {

            return base.OnDisconnectedAsync(exception);
        }
        return base.OnDisconnectedAsync(exception);
    }
    public Task SendMessage(string user, string message) => Clients.All.SendAsync("ReceiveMessage", user, message);
    public async Task SendToUser(ChatMessageViewModel chatMessageViewModel)
    {


        var reposnseMessage = await _chatService.AddChatMessage(chatMessageViewModel);
        chatMessageViewModel.Id = reposnseMessage.Id;
        var receiverConnectionId = UserIDConnectionID[chatMessageViewModel.Receiver.ToString()];
        var senderConnectionId = UserIDConnectionID[chatMessageViewModel.Sender.ToString()];

        if (receiverConnectionId is not null)
        {
            await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", chatMessageViewModel, "success");
        }

        if (senderConnectionId is not null)
        {
            await Clients.Client(senderConnectionId).SendAsync("ReceiveMessage", chatMessageViewModel, "success");
        }

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
        var currentUserConnectionId = UserIDConnectionID[model.UserId.ToString()];
        await Clients.GroupExcept(model.GroupName, currentUserConnectionId).SendAsync("ReceiveMessageFromGroup", model);
    }

    public void LikedMethod(string likedByUserID)
    {
        Clients.Client(UserIDConnectionID[likedByUserID]).SendAsync("NotifyLike");
    }

    public async Task NotifyCommentLike(CommentLikeUnlikeViiewModel model)
    {
        var reposnseMessage = await _chatService.LikeUnlikeComment(model);

        var currentUserConnectionId = UserIDConnectionID[model.UserId.ToString()];

        await Clients.GroupExcept(model.GroupName, currentUserConnectionId).SendAsync("NotifyCommentLikeToReceiver", reposnseMessage);
    }

    public async Task DeleteCommentById(CommentLikeUnlikeViiewModel model)
    {
        var reposnseMessage = await _chatService.DeleteCommentById(model);

        var currentUserConnectionId = UserIDConnectionID[model.UserId.ToString()];

        await Clients.GroupExcept(model.GroupName, currentUserConnectionId).SendAsync("NotifyCommentDelete", model.CommentId);
    }

    public async Task NotifyPostLike(string groupName, string userId, bool isLiked)
    {

        var currentUserConnectionId = UserIDConnectionID[userId];

        await Clients.GroupExcept(groupName, currentUserConnectionId).SendAsync("NotifyPostLikeToReceiver", isLiked);
    }

    public async Task NotifySaveStream(string groupName, string userId, bool isSaved)
    {

        var currentUserConnectionId = UserIDConnectionID[userId];

        await Clients.GroupExcept(groupName, currentUserConnectionId).SendAsync("NotifySaveStreamToReceiver", isSaved);
    }


    public async Task NotifyAddTeacher(Guid teacherId)
    {
        var teacher = _teacherRepository.GetById(teacherId);
        var currentUserConnectionId = UserIDConnectionID[teacher.UserId];

        await Clients.Client(currentUserConnectionId).SendAsync("NotifyAddTeacher", teacher.UserId);
    }

    public async Task NotifyCommentThrotlling(string groupName, int noOfComments)
    {
        await Clients.Group(groupName).SendAsync("NotifyCommentThrotllingToReceiver", noOfComments);
    }

    public async Task NotifyPostView(string groupName, string userId)
    {
        bool isAddView = false;
        int index = groupName.LastIndexOf('_'); // finds the index of the last space character
        string postId = groupName.Substring(0, index); // gets the substring from the start to the index

        //var currentUserConnectionId = UserIDConnectionID[userId];
        var isUserViewExist = await _viewRepository.GetAll().Where(x => x.UserId == userId && x.PostId == new Guid(postId)).FirstOrDefaultAsync();
        if (isUserViewExist != null)
        {
            isAddView = true;
        }
        await Clients.Group(groupName).SendAsync("NotifyPostViewToReceiver", isAddView);
    }

    public async Task NotifyShareStream(string groupName)
    {
        await Clients.Group(groupName).SendAsync("NotifyShareStreamToReceiver");
    }

    public async Task NotifyLiveUsersCount(string groupName, bool isLeaveStream)
    {

        //var currentUserConnectionId = UserIDConnectionID[userId];

        await Clients.Group(groupName).SendAsync("NotifyLiveUsersCountToReceiver", isLeaveStream);
    }

    public async Task NotifyEndMeeting(string groupName)
    {

        await Clients.Group(groupName).SendAsync("NotifyEndMeetingToReceiver");
    }

    public async Task SendNotification(NotificationViewModel model)
    {

        // if notification type live stream so here we will find all.
        if (model.FollowersIds == null)
        {
            var responseNotification = await _notificationService.AddNotification(model);

            var a = UserIDConnectionID[model.UserId.ToString()];

            if (a is not null || model.NotificationType == NotificationTypeEnum.PostUploaded)
                await Clients.Client(a).SendAsync("ReceiveNotification", responseNotification);

        }
        else
        {
            var notificationViewModel = new NotificationViewModel();
            //model.MeetingId = model.NotificationContent;
            if (model.ChatType == ChatType.Personal)
            {
                var user = _userRepository.GetById(model.ActionDoneBy);
                model.Avatar = user.Avatar;
                model.NotificationContent = $"{user.FirstName + ' '} {user.LastName} start a live {model.NotificationContent}";
                model.PostType = (int)PostAuthorTypeEnum.User;
            }
            if (model.ChatType == ChatType.School)
            {
                var school = _schoolRepository.GetById(model.ChatTypeId);
                model.Avatar = school.Avatar;
                model.NotificationContent = $"{school.SchoolName + ' '} start a lecture {model.NotificationContent}";
                model.PostType = (int)PostAuthorTypeEnum.School;
            }
            if (model.ChatType == ChatType.Class)
            {
                var classes = _classRepository.GetById(model.ChatTypeId);
                model.Avatar = classes.Avatar;
                model.NotificationContent = $"{classes.ClassName + ' '} start a lecture {model.NotificationContent}";
                model.PostType = (int)PostAuthorTypeEnum.Class;
            }

            foreach (var follower in model.FollowersIds)
            {
                model.UserId = follower;
                notificationViewModel = await _notificationService.AddNotification(model);
                if (UserIDConnectionID.ContainsKey(model.UserId.ToString()))
                {
                    var connectionId = UserIDConnectionID[model.UserId.ToString()];
                    await Clients.Client(connectionId).SendAsync("ReceiveNotification", notificationViewModel);
                }
            }
        }

    }

    public async Task UpdateProgress(float progress)
    {
        await Clients.All.SendAsync("UpdateProgress", progress);
    }

    public async Task CloseIyizicoThreeDAuthWindow(string userId)
    {
        var connectionId = UserIDConnectionID[userId.ToString()];
        await Clients.Client(connectionId).SendAsync("closeIyizicoThreeDAuthWindow", true);
    }

    //public async Task SendToUser(ChatMessageViewModel chatMessageViewModel)
    //{


    //    var reposnseMessage = await _chatService.AddChatMessage(chatMessageViewModel);
    //    chatMessageViewModel.Id = reposnseMessage.Id;
    //    var a = UserIDConnectionID[chatMessageViewModel.Receiver.ToString()];
    //    if (a is not null)
    //        await Clients.Client(a).SendAsync("ReceiveMessage", chatMessageViewModel, "success");

    //}
    public async Task LogoutBanUser(string userId)
    {
        var user = _userRepository.GetById(userId);
        var currentUserConnectionId = UserIDConnectionID[user.Id];
        await Clients.Client(currentUserConnectionId).SendAsync("logoutBanUser", userId);
    }

    public async Task ReloadClassCourseProfile(string classCourseId)
    {
        var classOrCourse = _classRepository.GetById(classCourseId);
        if(classOrCourse == null)
        {
            var courseOrClass = _courseRepository.GetById(classCourseId);
            var currentCourseConnectionId = UserIDConnectionID[courseOrClass.CourseId.ToString()];
            await Clients.Client(currentCourseConnectionId).SendAsync("reloadClassCourseProfile", classCourseId);
            return;
        }
        var currentClassConnectionId = UserIDConnectionID[classOrCourse.ClassId.ToString()];
        await Clients.Client(currentClassConnectionId).SendAsync("ReloadClassCourseProfile", classCourseId);
    }

}

public static class Extensions
{
    public static K FindFirstKeyByValue2<K, V>(this Dictionary<K, V> dict, V val)
    {
        return dict.FirstOrDefault(entry =>
            EqualityComparer<V>.Default.Equals(entry.Value, val)).Key;
    }
}
