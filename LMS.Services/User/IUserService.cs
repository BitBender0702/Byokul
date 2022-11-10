using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.User;

namespace LMS.Services
{
    public interface IUserService
    {
        Task<UserDetailsViewModel> GetUserById(string userId);
        Task SaveUserFollower(string schoolId, string userId);
        Task SaveUserLanguages(UserLanguageViewModel userLanguageViewModel);
        Task DeleteUserLanguage(UserLanguageDeleteViewModel model);
        Task UpdateUser(UserUpdateViewModel userUpdateViewModel);
        Task<IEnumerable<CountryViewModel>> CountryList();
        Task<IEnumerable<CityViewModel>> CityList(Guid countryId);

    }
}
