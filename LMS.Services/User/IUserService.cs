using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.User;

namespace LMS.Services
{
    public interface IUserService
    {
        Task<UserDetailsViewModel> GetUserById(string userId);
        Task<bool> SaveUserFollower(string schoolId, string userId);
        Task<UserUpdateViewModel> GetUserEditDetails(string userId);
        Task SaveUserLanguages(UserLanguageViewModel userLanguageViewModel);
        Task DeleteUserLanguage(UserLanguageDeleteViewModel model);
        Task<string> UpdateUser(UserUpdateViewModel userUpdateViewModel);
        Task<IEnumerable<CountryViewModel>> CountryList();
        Task<IEnumerable<CityViewModel>> CityList(Guid countryId);
        Task<IEnumerable<PostAttachmentViewModel>> GetMyFeed(string userId);
        Task<IEnumerable<PostAttachmentViewModel>> GetUserProfileFeed(string userId);
        Task<UserDetailsViewModel> GetBasicUserInfo(string userId);
        Task<List<UserFollowerViewModel>> GetUserFollowers(string userId);
        Task<bool> BanFollower(string followerId);

    }
}
