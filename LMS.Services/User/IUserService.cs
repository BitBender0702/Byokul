using LMS.Common.Enums;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;

namespace LMS.Services
{
    public interface IUserService
    {
        Task<UserDetailsViewModel> GetUserById(string userId);
        Task<bool> FollowUnFollowUser(FollowUnFollowViewModel model, string userId);
        Task<UserUpdateViewModel> GetUserEditDetails(string userId);
        Task SaveUserLanguages(UserLanguageViewModel userLanguageViewModel);
        Task DeleteUserLanguage(UserLanguageDeleteViewModel model);
        Task<UserUpdateViewModel> UpdateUser(UserUpdateViewModel userUpdateViewModel);
        Task<IEnumerable<CountryViewModel>> CountryList();
        Task<IEnumerable<CityViewModel>> CityList(Guid countryId);
        Task<IEnumerable<PostDetailsViewModel>> GetMyFeed(string userId,PostTypeEnum postType, string? searchString, int pageNumber);
        Task<IEnumerable<PostAttachmentViewModel>> GetUserProfileFeed(string userId);
        Task<UserDetailsViewModel> GetBasicUserInfo(string userId);
        Task<List<UserFollowerViewModel>> GetUserFollowers(string userId, int pageNumber, string? searchString);
        Task<bool> BanFollower(string followerId);
        Task<IEnumerable<GlobalFeedViewModel>> GetGlobalFeed(string userId, PostTypeEnum postType, int pageNumber, string? searchString);
        Task<Guid> SaveUserPreference(string userId,string preferenceString);
        Task<List<LikeViewModel>> GetLikesOnPost(Guid postId);
        Task<List<ViewsViewModel>> GetViewsOnPost(Guid postId);
        Task<int> GetCommentsCountOnPost(Guid postId);
        Task<IEnumerable<PostDetailsViewModel>> GetPostsByUserId(string userId, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetReelsByUserId(string userId, int pageNumber, int pageSize);
        Task<UserDetailsViewModel> GetUserByEmail(string email);
        //Task<List<UserFollowerViewModel>> SearchUserFollowers(string searchString);





    }
}
