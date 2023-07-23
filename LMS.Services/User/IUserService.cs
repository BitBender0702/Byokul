using LMS.Common.Enums;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
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
        Task<IEnumerable<PostDetailsViewModel>> GetMyFeed(string userId, PostTypeEnum postType, string? searchString, int pageNumber);
        Task<IEnumerable<PostAttachmentViewModel>> GetUserProfileFeed(string userId);
        Task<UserDetailsViewModel> GetBasicUserInfo(string userId);
        Task<List<UserFollowerViewModel>> GetUserFollowers(string userId, int pageNumber, string? searchString);
        Task<List<UserFollowingViewModel>> GetUserFollowings(string userId, int pageNumber, string? searchString);
        Task<bool> BanFollower(string followerId,string userId);
        Task<bool> UnBanFollower(string userId, string followerId);
        Task<IEnumerable<GlobalFeedViewModel>> GetGlobalFeed(string userId, PostTypeEnum postType, int pageNumber, string? searchString);
        Task<Guid> SaveUserPreference(string userId, string preferenceString);
        Task<List<LikeViewModel>> GetLikesOnPost(Guid postId);
        Task<List<ViewsViewModel>> GetViewsOnPost(Guid postId);
        Task<int> GetCommentsCountOnPost(Guid postId);
        Task<IEnumerable<PostDetailsViewModel>> GetPostsByUserId(string userId, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetReelsByUserId(string userId, int pageNumber, int pageSize);
        Task<UserDetailsViewModel> GetUserByEmail(string email);
        Task DeleteSchoolTeacher(Guid schoolId, string userId);
        Task DeleteSchoolStudent(Guid schoolId, string userId);
        Task ReportFollower(ReportFollowerViewModel model);
        Task<IEnumerable<GlobalSearchViewModel>> GlobalSearch(string searchString, int pageNumber,int pageSize);
        Task<IEnumerable<GlobalSearchViewModel>> UsersGlobalSearch(string searchString, int pageNumber, int pageSize);
        Task SaveUserCertificates(SaveUserCertificateViewModel model);
        Task DeleteUserCertificate(UserCertificateViewModel model);
        Task<bool> IsFollowerBan(string userId, string followerId);
        Task<IEnumerable<PostDetailsViewModel>> GetSliderReelsByUserId(string userId, Guid lastReelId, ScrollTypesEnum scrollType);
        Task<IEnumerable<PostDetailsViewModel>> GetMyFeedSliderReels(string userId, Guid lastReelId, ScrollTypesEnum scrollType);
        Task<IEnumerable<GlobalFeedViewModel>> GetGlobalFeedSliderReels(string userId, Guid lastReelId, ScrollTypesEnum scrollType);






    }
}
