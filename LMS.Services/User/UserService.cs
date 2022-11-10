using AutoMapper;
using LMS.Common.ViewModels.Account;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LMS.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<UserFollower> _userFollowerRepository;
        private IGenericRepository<UserLanguage> _userLanguageRepository;
        private IGenericRepository<City> _cityRepository;
        private IGenericRepository<Country> _countryRepository;
        private readonly UserManager<User> _userManager;
        public UserService(IMapper mapper, IGenericRepository<User> userRepository, IGenericRepository<UserFollower> userFollowerRepository, IGenericRepository<UserLanguage> userLanguageRepository, IGenericRepository<City> cityRepository, IGenericRepository<Country> countryRepository,UserManager<User> userManager)
        {
            _mapper = mapper;
            _userRepository = userRepository;
            _userFollowerRepository = userFollowerRepository;
            _userLanguageRepository = userLanguageRepository;
            _cityRepository = cityRepository;
            _countryRepository = countryRepository;
            _userManager = userManager;
        }
        public async Task<UserDetailsViewModel> GetUserById(string userId)
        {
            var user = await _userRepository.GetAll().Include( x => x.City).Where(x => x.Id == userId).FirstOrDefaultAsync();
            var result = _mapper.Map<UserDetailsViewModel>(user);
            result.Followers = await GetFollowers(userId);
            result.Languages = await GetLanguages(userId);
            result.Followings = await GetFollowings(userId);
            return result;

        }

        public async Task SaveUserFollower(string userId, string followerId)
        {
            var userFollower = new UserFollower
            {
                UserId = userId,
                FollowerId = followerId
            };

            _userFollowerRepository.Insert(userFollower);
            _userFollowerRepository.Save();
        }

        public async Task<int> GetFollowers(string userId)
        {
            var followerList = await _userFollowerRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();

            return followerList.Count();
            //var userViewModel = new List<UserViewModel>();
            //foreach (var follower in followerList)
            //{
            //    userViewModel.Add(_mapper.Map<UserViewModel>(follower.Follower));
            //}
            //return userViewModel;

            //var result = _mapper.Map<IEnumerable<UserFollowerViewModel>>(followerList);
            //return result;
        }

        public async Task<int> GetFollowings(string userId)
        {
            var followerList = await _userFollowerRepository.GetAll().Where(x => x.FollowerId == userId).ToListAsync();

            return followerList.Count();
            //var userViewModel = new List<UserViewModel>();
            //foreach (var follower in followerList)
            //{
            //    userViewModel.Add(_mapper.Map<UserViewModel>(follower.User));
            //}
            //return userViewModel;
        }

        public async Task SaveUserLanguages(UserLanguageViewModel userLanguageViewModel)
        {
            foreach (var languageId in userLanguageViewModel.LanguageIds)
            {
                var userLanguage = new UserLanguage
                {
                    UserId = userLanguageViewModel.UserId,
                    LanguageId = new Guid(languageId)
                };

                _userLanguageRepository.Insert(userLanguage);
                _userLanguageRepository.Save();
            }
        }

        public async Task DeleteUserLanguage(UserLanguageDeleteViewModel model)
        {

            var userLanguage = await _userLanguageRepository.GetAll().Where(x => x.UserId == model.UserId && x.LanguageId == new Guid(model.LanguageId)).FirstOrDefaultAsync();

            _userLanguageRepository.Delete(userLanguage.Id);
            _userLanguageRepository.Save();
        }

        async Task<IEnumerable<LanguageViewModel>> GetLanguages(string userId)
        {
            var userLanguages = _userLanguageRepository.GetAll()
                .Include(x => x.Language)
                .Where(x => x.UserId == userId).ToList();

            var languageViewModel = new List<LanguageViewModel>();
            foreach (var userLanguage in userLanguages)
            {
                languageViewModel.Add(_mapper.Map<LanguageViewModel>(userLanguage.Language));
            }
            return languageViewModel;
        }

        public async Task UpdateUser(UserUpdateViewModel userUpdateViewModel)
        {
            User user = _userRepository.GetById(userUpdateViewModel.Id);
            user.Avatar = userUpdateViewModel.Avatar;
            user.FirstName = userUpdateViewModel.FirstName;
            user.LastName = userUpdateViewModel.LastName;
            user.DOB = userUpdateViewModel.DOB;
            user.Gender = userUpdateViewModel.Gender;
            user.Description = userUpdateViewModel.Description;

            _userRepository.Update(user);
            _userRepository.Save();

        }

        public async Task<IEnumerable<CountryViewModel>> CountryList()
        {
            var countryList = await _countryRepository.GetAll().ToListAsync();
            var result = _mapper.Map<IEnumerable<CountryViewModel>>(countryList);
            return result;
        }

        public async Task<IEnumerable<CityViewModel>> CityList(Guid countryId)
        {
            var cityList = await _cityRepository.GetAll().Where(x => x.CountryId == countryId).ToListAsync();
            var result = _mapper.Map<IEnumerable<CityViewModel>>(cityList);
            return result;
        }

    }
}
