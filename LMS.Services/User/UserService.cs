using AutoMapper;
using F23.StringSimilarity;
using LMS.Common.Enums;
using LMS.Common.ViewModels.Account;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.Data.Entity.Common;
using LMS.DataAccess.GenericRepository;
using LMS.DataAccess.Repository;
using LMS.Services.Blob;
using LMS.Services.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using Country = LMS.Data.Entity.Country;

namespace LMS.Services
{
    public class UserService : IUserService
    {
        public string containerName = "userlogo";
        private readonly IMapper _mapper;
        private IConfiguration _config;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<UserFollower> _userFollowerRepository;
        private IGenericRepository<UserLanguage> _userLanguageRepository;
        private IGenericRepository<City> _cityRepository;
        private IGenericRepository<Country> _countryRepository;
        private IGenericRepository<SchoolFollower> _schoolFollowerRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private IGenericRepository<ClassStudent> _classStudentRepository;
        private IGenericRepository<CourseStudent> _courseStudentRepository;
        private IGenericRepository<ClassTeacher> _classTeacherRepository;
        private IGenericRepository<CourseTeacher> _courseTeacherRepository;
        private IGenericRepository<SchoolTeacher> _schoolTeacherRepository;
        private IGenericRepository<Student> _studentRepository;
        private IGenericRepository<Teacher> _teacherRepository;
        private IGenericRepository<School> _schoolRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private IGenericRepository<Post> _postRepository;
        private IGenericRepository<PostTag> _postTagRepository;
        private IGenericRepository<UserPreference> _userPreferenceRepository;
        private IGenericRepository<Like> _likeRepository;
        private IGenericRepository<View> _viewRepository;
        private IGenericRepository<Comment> _commentRepository;
        private IGenericRepository<StudentCertificate> _studentCertificateRepository;
        private IGenericRepository<UserSharedPost> _userSharedPostRepository;
        private IGenericRepository<SavedPost> _savedPostRepository;
        private IGenericRepository<UserCertificate> _userCertificateRepository;
        private readonly UserManager<User> _userManager;
        private readonly IBlobService _blobService;
        private readonly IPostRepository _postRepositoryCustom;
        private readonly ICommonService _commonService;


        public UserService(IMapper mapper, IConfiguration config, IWebHostEnvironment webHostEnvironment, IGenericRepository<User> userRepository, IGenericRepository<UserFollower> userFollowerRepository, IGenericRepository<UserLanguage> userLanguageRepository, IGenericRepository<City> cityRepository, IGenericRepository<Country> countryRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<CourseTeacher> courseTeacherRepository,
          IGenericRepository<SchoolTeacher> schoolteacherRepository, IGenericRepository<Student> studentRepository, IGenericRepository<Teacher> teacherRepository, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<Post> postRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<UserPreference> userPreferenceRepository, IGenericRepository<Like> likeRepository, IGenericRepository<View> viewRepository, IGenericRepository<Comment> commentRepository, IGenericRepository<StudentCertificate> studentCertificateRepository, IGenericRepository<UserSharedPost> userSharedPostRepository, IGenericRepository<SavedPost> savedPostRepository, UserManager<User> userManager, IBlobService blobService, IPostRepository postRepositoryCustom, IGenericRepository<UserCertificate> userCertificateRepository, ICommonService commonService)
        {
            _mapper = mapper;
            _config = config;
            _webHostEnvironment = webHostEnvironment;
            _userRepository = userRepository;
            _userFollowerRepository = userFollowerRepository;
            _userLanguageRepository = userLanguageRepository;
            _cityRepository = cityRepository;
            _countryRepository = countryRepository;
            _schoolFollowerRepository = schoolFollowerRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _classStudentRepository = classStudentRepository;
            _courseStudentRepository = courseStudentRepository;
            _classTeacherRepository = classTeacherRepository;
            _courseTeacherRepository = courseTeacherRepository;
            _schoolTeacherRepository = schoolteacherRepository;
            _studentRepository = studentRepository;
            _teacherRepository = teacherRepository;
            _schoolRepository = schoolRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _postRepository = postRepository;
            _postTagRepository = postTagRepository;
            _userPreferenceRepository = userPreferenceRepository;
            _likeRepository = likeRepository;
            _viewRepository = viewRepository;
            _commentRepository = commentRepository;
            _studentCertificateRepository = studentCertificateRepository;
            _userSharedPostRepository = userSharedPostRepository;
            _savedPostRepository = savedPostRepository;
            _userManager = userManager;
            _blobService = blobService;
            _postRepositoryCustom = postRepositoryCustom;
            _userCertificateRepository = userCertificateRepository;
            _commonService = commonService;
        }
        public async Task<UserDetailsViewModel> GetUserById(string userId)

        {
            var user = await _userRepository.GetAll().Include(x => x.UserLanguage).ThenInclude(x => x.Language).Where(x => x.Id == userId).FirstOrDefaultAsync();
            var result = _mapper.Map<UserDetailsViewModel>(user);
            result.Followers = await GetFollowers(userId);

            var item = user.UserLanguage.Select(x => x.Language);









            result.Languages = await GetLanguages(userId);
            result.Followings = await GetFollowings(userId);
            result.Posts = await GetPostsByUserId(userId);
            result.Reels = await GetReelsByUserId(userId);
            var classStudents = await GetClassStudents(userId);
            var courseStudents = await GetCourseStudents(userId);

            result.SchoolsAsStudent = classStudents.Union(courseStudents).DistinctBy(x => x.SchoolId).ToList();

            var schoolTeachers = await GetSchoolTeachers(userId);
            var classTeachers = await GetClassTeachers(userId);
            var courseTeachers = await GetCourseTeachers(userId);
            var studentCertificates = await GetStudentCertificate(userId);
            var userCertificates = await GetUserCertificate(userId);

            studentCertificates.AddRange(userCertificates);

            result.Certificates = studentCertificates;


            var classCourseTeachers = classTeachers.Union(courseTeachers).DistinctBy(x => x.SchoolId).ToList();

            result.SchoolsAsTeacher = classCourseTeachers.Union(schoolTeachers).DistinctBy(x => x.SchoolId).ToList();

            return result;

        }


        public async Task<List<CertificateViewModel>> GetStudentCertificate(string userId)
        {
            var studentCertificates = await _studentCertificateRepository.GetAll().Include(x => x.Student).Where(x => x.Student.UserId == userId).ToListAsync();
            return _mapper.Map<List<CertificateViewModel>>(studentCertificates);
        }

        public async Task<List<CertificateViewModel>> GetUserCertificate(string userId)
        {
            var userCertificates = await _userCertificateRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();
            return _mapper.Map<List<CertificateViewModel>>(userCertificates);
        }

        public async Task<UserUpdateViewModel> GetUserEditDetails(string userId)
        {
            var user = await _userRepository.GetAll().Where(x => x.Id == userId)
                .FirstOrDefaultAsync();

            var result = _mapper.Map<UserUpdateViewModel>(user);
            return result;
        }

        public async Task<bool> FollowUnFollowUser(FollowUnFollowViewModel model, string followerId)
        {
            var userFollowers = new List<UserFollower>();
            userFollowers = await _userFollowerRepository.GetAll().Where(x => x.UserId == model.Id && x.FollowerId == followerId).ToListAsync();

            if (userFollowers.Any(x => x.UserId == model.Id && x.FollowerId == followerId))
            {
                _userFollowerRepository.DeleteAll(userFollowers);
                _userFollowerRepository.Save();
            }

            else
            {
                var userFollower = new UserFollower
                {
                    UserId = model.Id,
                    FollowerId = followerId,
                    IsBan = false
                };

                _userFollowerRepository.Insert(userFollower);
                _userFollowerRepository.Save();
                return true;
            }
            return false;

            //if (!model.IsFollowed)
            //{
            //    var userFollower = await _userFollowerRepository.GetAll().Where(x => x.UserId == model.Id && x.FollowerId == followerId).FirstOrDefaultAsync();

            //    if (userFollower != null)
            //    {
            //        _userFollowerRepository.Delete(userFollower.Id);
            //        _userFollowerRepository.Save();
            //        return false;
            //    }
            //}

            //else
            //{
            //    var userFollower = new UserFollower
            //    {
            //        UserId = model.Id,
            //        FollowerId = followerId,
            //        IsBan = false
            //    };

            //    _userFollowerRepository.Insert(userFollower);
            //    _userFollowerRepository.Save();
            //    return true;
            //}
            //return false;
        }

        public async Task<IEnumerable<UserFollowerViewModel>> GetFollowers(string userId)
        {
            var followerList = await _userFollowerRepository.GetAll().Where(x => x.UserId == userId && !x.IsBan).Distinct().ToListAsync();
            return _mapper.Map<IEnumerable<UserFollowerViewModel>>(followerList);
        }

        public async Task<int> GetFollowings(string userId)
        {
            var followerList = await _userFollowerRepository.GetAll().Where(x => x.FollowerId == userId).ToListAsync();
            return followerList.Count();
        }

        public async Task<IEnumerable<SchoolViewModel>> GetClassStudents(string userId)
        {
            var studentList = await _studentRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();

            var classStudentsList = await _classStudentRepository.GetAll().Include(x => x.Class).ThenInclude(x => x.School).Distinct().ToListAsync();

            var requiredClassList = classStudentsList.Where(x => studentList.Any(y => y.StudentId == x.StudentId)).DistinctBy(x => x.ClassId);

            var schools = new List<School>();
            foreach (var item in requiredClassList)
            {
                schools.Add(item.Class.School);
            }

            var requiredSchools = _mapper.Map<List<SchoolViewModel>>(schools);


            return requiredSchools;

        }

        public async Task<IEnumerable<SchoolViewModel>> GetCourseStudents(string userId)
        {
            var studentList = await _studentRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();

            var courseStudentsList = await _courseStudentRepository.GetAll().Include(x => x.Course).ThenInclude(x => x.School).Distinct().ToListAsync();

            var requiredCourseList = courseStudentsList.Where(x => studentList.Any(y => y.StudentId == x.StudentId)).DistinctBy(x => x.CourseId);

            var schools = new List<School>();
            foreach (var item in requiredCourseList)
            {
                schools.Add(item.Course.School);
            }

            var requiredSchools = _mapper.Map<List<SchoolViewModel>>(schools);
            return requiredSchools;

        }

        public async Task<IEnumerable<SchoolViewModel>> GetSchoolTeachers(string userId)
        {
            var teacherList = await _teacherRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();

            var schoolTeachersList = await _schoolTeacherRepository.GetAll().Include(x => x.School).Distinct().ToListAsync();

            var requiredSchoolsList = schoolTeachersList.Where(x => teacherList.Any(y => y.TeacherId == x.TeacherId)).DistinctBy(x => x.SchoolId);

            var schools = new List<School>();
            foreach (var item in requiredSchoolsList)
            {
                schools.Add(item.School);
            }

            var requiredSchools = _mapper.Map<List<SchoolViewModel>>(schools);

            return requiredSchools;

        }

        public async Task<IEnumerable<SchoolViewModel>> GetClassTeachers(string userId)
        {
            var teachertList = await _teacherRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();

            var classTeachersList = await _classTeacherRepository.GetAll().Include(x => x.Class).ThenInclude(x => x.School).Distinct().ToListAsync();

            var requiredClassList = classTeachersList.Where(x => teachertList.Any(y => y.TeacherId == x.TeacherId)).DistinctBy(x => x.ClassId);

            var schools = new List<School>();
            foreach (var item in requiredClassList)
            {
                schools.Add(item.Class.School);
            }

            var requiredSchools = _mapper.Map<List<SchoolViewModel>>(schools);
            return requiredSchools;

        }

        public async Task<IEnumerable<SchoolViewModel>> GetCourseTeachers(string userId)
        {
            var teachertList = await _teacherRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();

            var courseTeachersList = await _courseTeacherRepository.GetAll().Include(x => x.Course).ThenInclude(x => x.School).Distinct().ToListAsync();

            var requiredCourseList = courseTeachersList.Where(x => teachertList.Any(y => y.TeacherId == x.TeacherId)).DistinctBy(x => x.CourseId);

            var schools = new List<School>();
            foreach (var item in requiredCourseList)
            {
                schools.Add(item.Course.School);
            }

            var requiredSchools = _mapper.Map<List<SchoolViewModel>>(schools);
            return requiredSchools;

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

        public async Task<UserUpdateViewModel> UpdateUser(UserUpdateViewModel userUpdateViewModel)
        {

            if (userUpdateViewModel.AvatarImage != null)
            {
                userUpdateViewModel.Avatar = await _blobService.UploadFileAsync(userUpdateViewModel.AvatarImage, containerName, false);
            }

            User user = _userRepository.GetById(userUpdateViewModel.Id);
            user.Avatar = userUpdateViewModel.Avatar == "null" ? null : userUpdateViewModel.Avatar;
            user.FirstName = userUpdateViewModel.FirstName;
            user.LastName = userUpdateViewModel.LastName;
            user.DOB = userUpdateViewModel.DOB;
            user.Gender = userUpdateViewModel.Gender;
            user.Description = userUpdateViewModel.Description;
            user.ContactEmail = userUpdateViewModel.ContactEmail;
            user.CountryName = userUpdateViewModel.CountryName;
            user.StateName = userUpdateViewModel.StateName;
            _userRepository.Update(user);
            _userRepository.Save();
            return _mapper.Map<UserUpdateViewModel>(user);

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

        private class FeedConvertDTO
        {
            public Guid? Id { get; set; }
            public string ParentImageUrl { get; set; }
            public string ParentName { get; set; }
            public string SchoolName { get; set; }
        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetMyFeed(string userId, PostTypeEnum postType, string? searchString, int pageNumber = 1)
        {
            int pageSize = 0;
            if (postType == PostTypeEnum.Post)
            {
                pageSize = 12;
            }

            if (postType == PostTypeEnum.Reel)
            {
                pageSize = 8;
            }

            var myFeeds = new List<PostDetailsViewModel>();

            var myData = await _userRepository.GetAll().Where(x => x.Id == userId).ToListAsync();
            var mySchoolData = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();
            var myClassData = await _classRepository.GetAll().Include(x => x.School).Where(x => x.CreatedById == userId).ToListAsync();
            var myCourseData = await _courseRepository.GetAll().Include(x => x.School).Where(x => x.CreatedById == userId).ToListAsync();


            // feeds from schools user follow
            var schoolFollowers = await _schoolFollowerRepository.GetAll()
                .Include(x => x.User)
                .Include(x => x.School)
                .Where(x => x.UserId == userId).ToListAsync();

            var userFollowersData = await _userFollowerRepository.GetAll().Include(x => x.User).Where(x => x.FollowerId == userId).ToListAsync();

            var classStudentsData = await _classStudentRepository.GetAll()
                .Include(x => x.Student)
                .Include(x => x.Class)
                .ThenInclude(x => x.School)
                .Where(x => x.Student.UserId == userId).ToListAsync();

            var courseStudentsData = await _courseStudentRepository.GetAll()
                .Include(x => x.Student)
                .Include(x => x.Course)
                .ThenInclude(x => x.School)
                .Where(x => x.Student.UserId == userId).ToListAsync();

            var requiredIds = schoolFollowers.Select(x => new FeedConvertDTO { Id = x.SchoolId, ParentImageUrl = x.School.Avatar, ParentName = x.School.SchoolName, SchoolName = "" }).ToList();
            var testData = userFollowersData.Where(p => p.UserId != string.Empty).Select(x => new FeedConvertDTO { Id = new Guid(x.UserId), ParentImageUrl = x.User.Avatar, ParentName = x.User.FirstName, SchoolName = "" }).ToList();
            requiredIds.AddRange(testData);
            requiredIds.AddRange(classStudentsData.Select(c => new FeedConvertDTO { Id = c.ClassId, ParentImageUrl = c.Class.Avatar, ParentName = c.Class.ClassName, SchoolName = c.Class.School.SchoolName }).ToList());
            requiredIds.AddRange(courseStudentsData.Select(c => new FeedConvertDTO { Id = c.CourseId, ParentImageUrl = c.Course.Avatar, ParentName = c.Course.CourseName, SchoolName = c.Course.School.SchoolName }).ToList());

            requiredIds.AddRange(myData.Select(c => new FeedConvertDTO { Id = new Guid(c.Id), ParentImageUrl = c.Avatar, ParentName = c.FirstName, SchoolName = "" }).ToList());

            requiredIds.AddRange(mySchoolData.Select(c => new FeedConvertDTO { Id = c.SchoolId, ParentImageUrl = c.Avatar, ParentName = c.SchoolName, SchoolName = "" }).ToList());

            requiredIds.AddRange(myClassData.Select(c => new FeedConvertDTO { Id = c.ClassId, ParentImageUrl = c.Avatar, ParentName = c.ClassName, SchoolName = c.School.SchoolName }).ToList());

            requiredIds.AddRange(myCourseData.Select(c => new FeedConvertDTO { Id = c.CourseId, ParentImageUrl = c.Avatar, ParentName = c.CourseName, SchoolName = c.School.SchoolName }).ToList());


            var postList = _postRepository.GetAll().Include(x => x.CreatedBy);
            var test = requiredIds.Where(a => a.Id.HasValue).ToList();
            var postListData = postList.Include(p => p.CreatedBy).AsEnumerable().Where(x => test.Any(q => q.Id == x.ParentId) && x.PostType == (int)postType && ((string.IsNullOrEmpty(searchString)) || (string.IsNullOrEmpty(x.Title) || (x.Title.ToLower().Contains(searchString.ToLower()))))).OrderByDescending(x => x.CreatedOn).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            var sharedPosts = await _userSharedPostRepository.GetAll().ToListAsync();
            var savedPosts = await _savedPostRepository.GetAll().ToListAsync();


            var resultData = _mapper.Map<List<PostDetailsViewModel>>(postListData);
            foreach (var post in resultData)
            {
                var data = requiredIds.FirstOrDefault(x => x.Id == post.ParentId);
                var attachment = await GetAttachmentsByPostId(post.Id);
                post.PostAttachments = attachment;
                post.ParentImageUrl = data.ParentImageUrl;
                post.ParentName = data.ParentName;
                post.Likes = await GetLikesOnPost(post.Id);
                post.Views = await GetViewsOnPost(post.Id);
                post.CommentsCount = await GetCommentsCountOnPost(post.Id);
                post.PostSharedCount = sharedPosts.Where(x => x.PostId == post.Id).Count();
                post.IsPostSavedByCurrentUser = savedPosts.Any(x => x.PostId == post.Id && x.UserId == userId);
                post.SavedPostsCount = savedPosts.Where(x => x.PostId == post.Id && x.UserId == userId).Count();
                post.ParentId = data.Id != null ? data.Id.Value : Guid.Empty;
                post.SchoolName = data.SchoolName;
                if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
                {
                    post.IsPostLikedByCurrentUser = true;
                }
                else
                {
                    post.IsPostLikedByCurrentUser = false;
                }
            }

            foreach (var post in resultData)
            {
                var tags = await GetTagsByPostId(post.Id);
                post.PostTags = tags;
            }

            myFeeds.AddRange(resultData);
            return myFeeds;
        }

        public async Task<IEnumerable<PostAttachmentViewModel>> GetUserProfileFeed(string userId)
        {
            var userProfileFeeds = new List<PostAttachmentViewModel>();

            var postAttachments = await _postAttachmentRepository.GetAll().Include(x => x.Post).Where(x => x.Post.CreatedById == userId).ToListAsync();

            foreach (var isCompressed in postAttachments)
            {
                if (!string.IsNullOrEmpty(isCompressed.CompressedFileUrl))
                {
                    isCompressed.FileUrl = isCompressed.CompressedFileUrl;
                }
            }

            userProfileFeeds.AddRange(_mapper.Map<List<PostAttachmentViewModel>>(postAttachments));
            return userProfileFeeds;

        }

        public async Task<UserDetailsViewModel> GetBasicUserInfo(string userId)
        {
            var user = await _userRepository.GetAll().Where(x => x.Id == userId).FirstOrDefaultAsync();

            var response = _mapper.Map<UserDetailsViewModel>(user);
            return response;

        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsByUserId(string userId, int pageNumber = 1, int pageSize = 12)
        {

            var postList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == new Guid(userId) && (x.PostType == (int)PostTypeEnum.Post || (x.PostType == (int)PostTypeEnum.Stream && x.IsLive == true)) && x.PostAuthorType == (int)PostAuthorTypeEnum.User && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ToListAsync();

            var requiredPostList = postList.OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToList();

            var result = _mapper.Map<List<PostDetailsViewModel>>(requiredPostList).Skip((pageNumber - 1) * pageSize).Take(pageSize);
            var savedPosts = await _savedPostRepository.GetAll().ToListAsync();

            foreach (var post in result)
            {
                if (post.PostAuthorType == (int)PostAuthorTypeEnum.School)
                {
                    var school = _schoolRepository.GetById(post.ParentId);
                    post.ParentName = school.SchoolName;
                    post.ParentImageUrl = school.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Class)
                {
                    var classes = _classRepository.GetById(post.ParentId);
                    post.ParentName = classes.ClassName;
                    post.ParentImageUrl = classes.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Course)
                {
                    var course = _courseRepository.GetById(post.ParentId);
                    post.ParentName = course.CourseName;
                    post.ParentImageUrl = course.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.User)
                {
                    var user = _userRepository.GetById(post.ParentId.ToString());
                    post.ParentName = user.FirstName + " " + user.LastName;
                    post.ParentImageUrl = user.Avatar;
                }

                post.PostAttachments = await GetAttachmentsByPostId(post.Id);
                post.Likes = await GetLikesOnPost(post.Id);
                post.Views = await GetViewsOnPost(post.Id);
                post.CommentsCount = await GetCommentsCountOnPost(post.Id);
                post.PostSharedCount = await _userSharedPostRepository.GetAll().Where(x => x.PostId == post.Id).CountAsync();
                post.IsPostSavedByCurrentUser = savedPosts.Any(x => x.PostId == post.Id && x.UserId == userId);
                post.SavedPostsCount = savedPosts.Where(x => x.PostId == post.Id).Count();
                if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
                {
                    post.IsPostLikedByCurrentUser = true;
                }
                else
                {
                    post.IsPostLikedByCurrentUser = false;
                }

            }

            foreach (var post in result)
            {
                post.PostTags = await GetTagsByPostId(post.Id);
            }
            return result;

        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetReelsByUserId(string userId, int pageNumber = 1, int pageSize = 8)
        {
            var reelList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == new Guid(userId) && x.PostType == (int)PostTypeEnum.Reel && x.PostAuthorType == (int)PostAuthorTypeEnum.User && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToListAsync();

            var result = _mapper.Map<List<PostDetailsViewModel>>(reelList).Skip((pageNumber - 1) * pageSize).Take(pageSize);

            foreach (var post in result)
            {
                if (post.PostAuthorType == (int)PostAuthorTypeEnum.School)
                {
                    var school = _schoolRepository.GetById(post.ParentId);
                    post.ParentName = school.SchoolName;
                    post.ParentImageUrl = school.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Class)
                {
                    var classes = _classRepository.GetById(post.ParentId);
                    post.ParentName = classes.ClassName;
                    post.ParentImageUrl = classes.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Course)
                {
                    var course = _courseRepository.GetById(post.ParentId);
                    post.ParentName = course.CourseName;
                    post.ParentImageUrl = course.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.User)
                {
                    var user = _userRepository.GetById(post.ParentId.ToString());
                    post.ParentName = user.FirstName + " " + user.LastName;
                    post.ParentImageUrl = user.Avatar;
                }

                post.PostAttachments = await GetAttachmentsByPostId(post.Id);
                post.Likes = await GetLikesOnPost(post.Id);
                post.Views = await GetViewsOnPost(post.Id);
                post.CommentsCount = await GetCommentsCountOnPost(post.Id);
                if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
                {
                    post.IsPostLikedByCurrentUser = true;
                }
                else
                {
                    post.IsPostLikedByCurrentUser = false;
                }

            }

            foreach (var post in result)
            {
                post.PostTags = await GetTagsByPostId(post.Id);
            }
            return result;

        }


        public async Task<IEnumerable<PostDetailsViewModel>> GetSliderReelsByUserId(string userId, Guid lastPostId, ScrollTypesEnum scrollType)
        {
            var requiredResults = new List<Post>();
            var reelList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == new Guid(userId) && x.PostType == (int)PostTypeEnum.Reel && x.PostAuthorType == (int)PostAuthorTypeEnum.User && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToListAsync();


            if (scrollType == ScrollTypesEnum.None)
            {

                var attachment = _postAttachmentRepository.GetById(lastPostId);
                int index = reelList.FindIndex(x => x.Id == attachment.PostId);
                int startIndex = Math.Max(0, index - 3);
                int totalItems = 7;
                requiredResults = reelList.GetRange(startIndex, Math.Min(totalItems, reelList.Count - startIndex));


            }
            if (scrollType == ScrollTypesEnum.Down)
            {
                requiredResults = reelList.SkipWhile(x => x.Id != lastPostId).Skip(1).Take(3).ToList();

            }
            if (scrollType == ScrollTypesEnum.Up)
            {
                requiredResults = reelList.TakeWhile(x => x.Id != lastPostId).Reverse().Take(3).Reverse().ToList();

            }
            var result = _mapper.Map<List<PostDetailsViewModel>>(requiredResults);

            foreach (var post in result)
            {
                if (post.PostAuthorType == (int)PostAuthorTypeEnum.School)
                {
                    var school = _schoolRepository.GetById(post.ParentId);
                    post.ParentName = school.SchoolName;
                    post.ParentImageUrl = school.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Class)
                {
                    var classes = _classRepository.GetById(post.ParentId);
                    post.ParentName = classes.ClassName;
                    post.ParentImageUrl = classes.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Course)
                {
                    var course = _courseRepository.GetById(post.ParentId);
                    post.ParentName = course.CourseName;
                    post.ParentImageUrl = course.Avatar;
                }

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.User)
                {
                    var user = _userRepository.GetById(post.ParentId.ToString());
                    post.ParentName = user.FirstName + " " + user.LastName;
                    post.ParentImageUrl = user.Avatar;
                }

                post.PostAttachments = await GetAttachmentsByPostId(post.Id);
                post.Likes = await GetLikesOnPost(post.Id);
                post.Views = await GetViewsOnPost(post.Id);
                post.CommentsCount = await GetCommentsCountOnPost(post.Id);
                if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
                {
                    post.IsPostLikedByCurrentUser = true;
                }
                else
                {
                    post.IsPostLikedByCurrentUser = false;
                }

            }

            foreach (var post in result)
            {
                post.PostTags = await GetTagsByPostId(post.Id);
            }
            return result;
        }

        public async Task<List<UserFollowerViewModel>> GetUserFollowers(string userId, int pageNumber, string? searchString)
        {
            int pageSize = 13;
            var followerList = await _userFollowerRepository.GetAll().Include(x => x.Follower)
                .Where(x => x.UserId == userId && !x.IsBan && ((string.IsNullOrEmpty(searchString)) || (x.Follower.FirstName.Contains(searchString) || x.Follower.LastName.Contains(searchString) || (x.Follower.FirstName + " " + x.Follower.LastName).ToLower().Contains(searchString.ToLower())))).Skip((pageNumber - 1) * pageSize)
                .Take(pageSize).ToListAsync();

            var response = _mapper.Map<List<UserFollowerViewModel>>(followerList);
            return response;

        }

        public async Task<List<UserFollowingViewModel>> GetUserFollowings(string userId, int pageNumber, string? searchString)
        {
            int pageSize = 13;
            var followingList = await _userFollowerRepository.GetAll().Include(x => x.User)
                .Where(x => x.FollowerId == userId && ((string.IsNullOrEmpty(searchString)) || (x.User.FirstName.Contains(searchString) || x.User.LastName.Contains(searchString) || (x.User.FirstName + " " + x.User.LastName).ToLower().Contains(searchString.ToLower())))).Skip((pageNumber - 1) * pageSize)
                .Take(pageSize).ToListAsync();

            var response = _mapper.Map<List<UserFollowingViewModel>>(followingList);
            foreach (var item in response)
            {
                item.IsUserFollowing = true;
            }
            return response;

        }

        public async Task<bool> BanFollower(string followerId, string userId)
        {
            var follower = await _userFollowerRepository.GetAll().Where(x => x.FollowerId == followerId && x.UserId == userId).FirstOrDefaultAsync();

            if (follower != null)
            {
                follower.IsBan = true;
                _userFollowerRepository.Update(follower);
                _userFollowerRepository.Save();
                return true;
            }

            return false;



        }

        public async Task<bool> UnBanFollower(string userId, string followerId)
        {
            var follower = await _userFollowerRepository.GetAll().Where(x => x.FollowerId == followerId && x.UserId == userId).FirstOrDefaultAsync();

            if (follower != null)
            {
                follower.IsBan = false;
                _userFollowerRepository.Update(follower);
                _userFollowerRepository.Save();
                return true;
            }

            return false;



        }

        //public async Task<IEnumerable<PostAttachmentViewModel>> GetAttachmentsByPostId(Guid postId)
        //{
        //    var attachmentList = await _postAttachmentRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.PostId == postId).OrderByDescending(x => x.IsPinned).ToListAsync();
        //    var compressed = "";
        //    foreach (var isCompressed in attachmentList)
        //    {
        //        compressed = isCompressed.CompressedFileUrl;
        //        isCompressed.FileUrl
        //    }

        //    var result = _mapper.Map<List<PostAttachmentViewModel>>(attachmentList);
        //    return result;
        //}

        public async Task<IEnumerable<PostAttachmentViewModel>> GetAttachmentsByPostId(Guid postId)
        {
            var attachmentList = await _postAttachmentRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.PostId == postId).OrderByDescending(x => x.IsPinned).ToListAsync();

            foreach (var isCompressed in attachmentList)
            {
                if (!string.IsNullOrEmpty(isCompressed.CompressedFileUrl))
                {
                    isCompressed.FileUrl = isCompressed.CompressedFileUrl;
                }
                isCompressed.FileThumbnail = $"https://byokulstorage.blob.core.windows.net/userpostscompressed/thumbnails/{isCompressed.Id}.png";
            }

            var result = _mapper.Map<List<PostAttachmentViewModel>>(attachmentList);
            return result;
        }

        public async Task<List<LikeViewModel>> GetLikesOnPost(Guid postId)
        {
            var likes = await _likeRepository.GetAll().Where(x => x.PostId == postId).ToListAsync();
            return _mapper.Map<List<LikeViewModel>>(likes);
        }
        public async Task<List<ViewsViewModel>> GetViewsOnPost(Guid postId)
        {
            var views = await _viewRepository.GetAll().Where(x => x.PostId == postId).ToListAsync();
            return _mapper.Map<List<ViewsViewModel>>(views);

        }

        public async Task<IEnumerable<PostTagViewModel>> GetTagsByPostId(Guid postId)
        {
            var tagList = await _postTagRepository.GetAll().Where(x => x.PostId == postId).ToListAsync();

            var result = _mapper.Map<List<PostTagViewModel>>(tagList);
            return result;
        }

        public async Task<IEnumerable<GlobalFeedViewModel>> GetGlobalFeedFromCache(string userId, PostTypeEnum postType, int pageNumber, string? searchString)
        {
            int pageSize = 0;
            if (postType == PostTypeEnum.Post)
            {
                pageSize = 12;
            }

            if (postType == PostTypeEnum.Reel)
            {
                pageSize = 8;
            }
            var tokenList = new List<string>();
            var result = await _userPreferenceRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();

            if (result != null)
            {
                tokenList = result.PreferenceTokens.Split(' ').ToList();

            }
            else
            {
                tokenList = await GetDefaultGlobalfeeds(userId);
            }

            if (tokenList.Count() != 0)
            {
                var PostGUIDScore = await GenericCompareAlgo(String.Join(" ", tokenList), postType);
                return await GetFeedResult(PostGUIDScore, userId, postType, pageNumber, pageSize, searchString, null, null);
            }
            else
            {
                return await GetDefaultFeeds(userId, postType, pageNumber, pageSize, searchString, null, null);
            }

        }

        public async Task<IEnumerable<GlobalFeedViewModel>> GetGlobalFeed(string userId, PostTypeEnum postType, int pageNumber, string? searchString)
        {
            int pageSize = 0;
            if (postType == PostTypeEnum.Post)
            {
                pageSize = 12;
            }

            if (postType == PostTypeEnum.Reel)
            {
                pageSize = 8;
            }
            var tokenList = new List<string>();
            var result = await _userPreferenceRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();

            if (result != null)
            {
                tokenList = result.PreferenceTokens.Split(' ').ToList();

            }
            else
            {
                tokenList = await GetDefaultGlobalfeeds(userId);
            }

            if (tokenList.Count() != 0)
            {
                var PostGUIDScore = await GenericCompareAlgo(String.Join(" ", tokenList), postType);
                return await GetFeedResult(PostGUIDScore, userId, postType, pageNumber, pageSize, searchString, null, null);
            }
            else
            {
                return await GetDefaultFeeds(userId, postType, pageNumber, pageSize, searchString,null, null);
            }

        }

        async Task<List<string>> GetDefaultGlobalfeeds(string userId)
        {
            // for one school
            var isUserInSchool = await _schoolFollowerRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();

            if (isUserInSchool == null)
            {
                var isUserInClass = await _classStudentRepository.GetAll().Include(x => x.Student).Where(x => x.Student.UserId == userId).FirstOrDefaultAsync();

                if (isUserInClass == null)
                {
                    var isUserInCourse = await _courseStudentRepository.GetAll().Include(x => x.Student).Where(x => x.Student.UserId == userId).FirstOrDefaultAsync();

                    if (isUserInCourse == null)
                    {
                        // student not followed and enrolled any school, class and course.
                        return new List<string>();
                    }

                    else
                    {
                        var sameUserList = await _courseStudentRepository.GetAll().Include(x => x.Student).Where(x => x.Student.UserId == userId).ToListAsync();

                        sameUserList.Remove(isUserInCourse);

                        int count = (int)(sameUserList.Count * 10 / 100);
                        if (count == 0 && sameUserList.Count != 0)
                        {
                            count = sameUserList.Count();
                        }
                        var requiredNUserIds = sameUserList.Take(count).Select(x => x.Student.UserId).ToList();
                        var tokenList = await GetOtherUserPreferences(requiredNUserIds);
                        if (tokenList.Count == 0)
                        {
                            return new List<string>() { isUserInCourse.Course.Description };
                        }
                        return tokenList;
                    }
                }

                else
                {
                    // if user in class
                    var sameUserList = await _classStudentRepository.GetAll().Include(x => x.Student).Where(x => x.Student.UserId == userId).ToListAsync();

                    sameUserList.Remove(isUserInClass);

                    int count = (int)(sameUserList.Count * 10 / 100);
                    if (count == 0 && sameUserList.Count != 0)
                    {
                        count = sameUserList.Count();
                    }
                    var requiredNUserIds = sameUserList.Take(count).Select(x => x.Student.UserId).ToList();
                    var tokenList = await GetOtherUserPreferences(requiredNUserIds);

                    if (tokenList.Count == 0)
                    {
                        return new List<string>() { isUserInClass.Class.Description };
                    }

                    return tokenList;

                }


            }

            else
            {
                var sameUserList = await _schoolFollowerRepository.GetAll().Where(x => x.SchoolId == isUserInSchool.SchoolId).ToListAsync();

                sameUserList.Remove(isUserInSchool);

                int count = (int)(sameUserList.Count * 10 / 100);
                if (count == 0 && sameUserList.Count != 0)
                {
                    count = sameUserList.Count();
                }
                var requiredNUserIds = sameUserList.Take(count).Select(x => x.UserId).ToList();
                var tokenList = await GetOtherUserPreferences(requiredNUserIds);

                if (tokenList.Count == 0)
                {
                    var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == isUserInSchool.SchoolId).Include(x => x.Specialization).FirstAsync();

                    return new List<string>() { school.Specialization.Name + school.Description };
                }

                return tokenList;
            }

            return null;



        }

        async Task<List<string>> GetOtherUserPreferences(IEnumerable<string> userIds)
        {
            var userPreferenceList = await _userPreferenceRepository.GetAll().ToListAsync();
            var tokenList = new List<string>();
            foreach (var userId in userIds)
            {
                var result = userPreferenceList.Where(x => x.UserId == userId).FirstOrDefault();

                if (result != null)
                {
                    tokenList = tokenList.Concat(userPreferenceList.Where(x => x.UserId == userId).First().PreferenceTokens.Split(',').ToList()).ToList();
                }
                //else
                //{
                //    var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == schoolId).Include(x => x.Specialization).FirstAsync();

                //    return new List<string>() { school.Specialization.Name + school.Description};
                //}
            }

            return tokenList;
        }


        async Task<Dictionary<Guid, double>> GenericCompareAlgo(string tokenList, PostTypeEnum postType)
        {
            double averageScore = 0;
            var DBPostTokens = new List<string>();
            var PostGUIDScore = new Dictionary<Guid, double>();
            var PostGUIDScore2 = new Dictionary<Guid, int>();

            var listOfPosts = await _postRepository.GetAll().Where(x => x.PostType == (int)postType)
                //.Skip((pageNumber - 1) * pageSize).Take(pageSize)
                .ToListAsync();
            //var clientPosts = await _postRepository.GetAll().Where(x => x.ParentId == new Guid("2C0296BC-33D4-4479-775F-08DB81F59785")).ToListAsync();

            //listOfPosts.AddRange(clientPosts);
            var listOfTags = await _postTagRepository.GetAll().ToListAsync();

            var levenshtein = new Levenshtein();

            foreach (var post in listOfPosts)
            {
                string item;
                var isTags = listOfTags.Where(x => x.PostId == post.Id).ToList();
                if (isTags.Count() != 0)
                {
                    item = string.Concat(post.Title, post.Title != null ? " " : "", post.Description, post.Description != null ? " " : "", string.Join(" ", isTags.Select(x => x.PostTagValue)));
                }

                else
                {
                    item = string.Concat(post.Title, post.Title != null ? " " : "", post.Description);
                }

                var similarity = new Jaccard().Similarity(tokenList, item);
                var score = (similarity * 100);
                PostGUIDScore.Add(post.Id, score);
            }

            DateTime currentDate = DateTime.Now.Date;
            DateTime fiveDaysAgo = currentDate.AddDays(-5);
            Random random = new Random();

            var clientPosts = await _postRepository.GetAll().Where(x => x.ParentId == new Guid("2C0296BC-33D4-4479-775F-08DB81F59785") && x.CreatedOn >= fiveDaysAgo).ToListAsync();

            var PostGUIDScores = PostGUIDScore.Where(x => x.Value > 10);
            if (PostGUIDScores.Count() != 0)
            {
                averageScore = PostGUIDScore.Where(x => x.Value > 10).Select(x => x.Value).Average();
            }
            else
            {
                averageScore = PostGUIDScore.Values.Average();
            }

            foreach (var post in clientPosts)
            {
                double randomScore = averageScore + random.NextDouble();
                if (PostGUIDScore.ContainsKey(post.Id))
                {
                    PostGUIDScore[post.Id] = randomScore;
                }
            }

            var result = PostGUIDScore.OrderByDescending(x => x.Value).ToDictionary(x => x.Key, x => x.Value);
            return result;

        }

        async Task<List<GlobalFeedViewModel>> GetFeedResult(Dictionary<Guid, double> postGUIDScore, string loginUserId, PostTypeEnum postType, int pageNumber, int pageSize, string? searchString, Guid? lastPostId, ScrollTypesEnum? scrollType)
        {
            bool IsPostLikedByCurrentUser;
            var response = new List<GlobalFeedViewModel>();
            Guid[] requiredPostIds = null;

            if (lastPostId != null)
            {
                if (scrollType == ScrollTypesEnum.None)
                {

                    var attachment = _postAttachmentRepository.GetById(lastPostId);
                    ////int index = postGUIDScore.FindIndex(x => x.Id == attachment.PostId);
                    ////int startIndex = Math.Max(0, index - 3);
                    ////int totalItems = 7;
                    //requiredPostIds = postGUIDScore.GetRange(startIndex, Math.Min(totalItems, postGUIDScore.Count - startIndex));




                    // Find the index of lastPostId in the dictionary keys
                    var keys = postGUIDScore.Keys.ToList();
                    var index = keys.FindIndex(key => key == attachment.PostId);

                    // Define the range parameters
                    int startIndex = Math.Max(0, index - 3);
                    int totalItems = 7;

                    // Get the range of items from the dictionary
                    requiredPostIds = keys.Skip(startIndex).Take(Math.Min(totalItems, keys.Count - startIndex)).ToArray();


                }
                if (scrollType == ScrollTypesEnum.Down)
                {
                    requiredPostIds = postGUIDScore.Keys.SkipWhile(x => x != lastPostId).Skip(1).Take(3).ToArray();

                }
                if (scrollType == ScrollTypesEnum.Up)
                {
                    requiredPostIds = postGUIDScore.Keys.TakeWhile(x => x != lastPostId).Reverse().Take(3).Reverse().ToArray();
                }
            }

            else
            {
                requiredPostIds = postGUIDScore.Keys.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToArray();

            }
            var postList = await _postRepositoryCustom.GetPostsByIds(requiredPostIds);
            var postAttachmentList = await _postAttachmentRepository.GetAll().ToListAsync();
            var postTagsList = await _postTagRepository.GetAll().ToListAsync();
            var likesList = await _likeRepository.GetAll().ToListAsync();
            var sharedPostList = await _userSharedPostRepository.GetAll().ToListAsync();
            var savedPosts = await _savedPostRepository.GetAll().ToListAsync();

            foreach (var post in postList)
            {
                if (post != null)
                {
                    var postAttachment = postAttachmentList.Where(x => x.PostId == post.Id).ToList();
                    var postTag = postTagsList.Where(x => x.PostId == post.Id).ToList();
                    var likes = await GetLikesOnPost(post.Id);
                    var views = await GetViewsOnPost(post.Id);
                    var commentsCount = await GetCommentsCountOnPost(post.Id);
                    var sharedPostCount = sharedPostList.Where(x => x.PostId == post.Id).Count();
                    var isLiked = likesList.Any(x => x.UserId == loginUserId && x.PostId == post.Id);

                    if (isLiked)
                    {
                        IsPostLikedByCurrentUser = true;
                    }
                    else
                    {
                        IsPostLikedByCurrentUser = false;
                    }

                    string parentName = "";
                    string parentImageUrl = "";
                    string schoolName = "";
                    string parentId = "";
                    int postAuthorType = 0;
                    if (post.PostAuthorType == (int)PostAuthorTypeEnum.School)
                    {
                        var school = _schoolRepository.GetById(post.ParentId);
                        parentName = school.SchoolName;
                        parentImageUrl = school.Avatar;
                        postAuthorType = (int)PostAuthorTypeEnum.School;
                        schoolName = "";
                        parentId = school.SchoolId.ToString();



                    }
                    if (post.PostAuthorType == (int)PostAuthorTypeEnum.Class)
                    {
                        var classes = await _classRepository.GetAll().Where(x => x.ClassId == post.ParentId).Include(x => x.School).FirstOrDefaultAsync();
                        parentName = classes.ClassName;
                        parentImageUrl = classes.Avatar;
                        postAuthorType = (int)PostAuthorTypeEnum.Class;
                        schoolName = classes.School.SchoolName;
                        parentId = classes.ClassId.ToString();
                    }
                    if (post.PostAuthorType == (int)PostAuthorTypeEnum.Course)
                    {
                        var course = await _courseRepository.GetAll().Where(x => x.CourseId == post.ParentId).Include(x => x.School).FirstOrDefaultAsync();
                        parentName = course.CourseName;
                        parentImageUrl = course.Avatar;
                        postAuthorType = (int)PostAuthorTypeEnum.Course;
                        schoolName = course.School.SchoolName;
                        parentId = course.CourseId.ToString();
                    }
                    if (post.PostAuthorType == (int)PostAuthorTypeEnum.User)
                    {
                        var user = _userRepository.GetById(post.ParentId.ToString());
                        parentName = user.FirstName + " " + user.LastName;
                        parentImageUrl = user.Avatar;
                        postAuthorType = (int)PostAuthorTypeEnum.User;
                        schoolName = "";
                        parentId = user.Id;
                    }
                    var result = new GlobalFeedViewModel()
                    {
                        Id = post.Id,
                        Title = post.Title,
                        Description = post.Description,
                        Likes = likes,
                        Views = views,
                        CommentsCount = commentsCount,
                        PostSharedCount = sharedPostCount,
                        IsPostLikedByCurrentUser = IsPostLikedByCurrentUser,
                        PostType = post.PostType,
                        ParentName = parentName,
                        ParentImageUrl = parentImageUrl,
                        PostAuthorType = postAuthorType,
                        SchoolName = schoolName,
                        ParentId = parentId,
                        DateTime = post.DateTime,
                        PostAttachments = _mapper.Map<List<PostAttachmentViewModel>>(postAttachment),
                        PostTags = _mapper.Map<List<PostTagViewModel>>(postTag),
                        CreatedBy = post.CreatedById,
                        IsPostSavedByCurrentUser = savedPosts.Any(x => x.PostId == post.Id && x.UserId == loginUserId),
                        SavedPostsCount = savedPosts.Where(x => x.PostId == post.Id && x.UserId == loginUserId).Count()

                    };

                    response.Add(result);
                }

            }
            return response;
        }

        async Task<List<GlobalFeedViewModel>> GetDefaultFeeds(string loginUserId, PostTypeEnum postType, int pageNumber, int pageSize, string? searchString, Guid? lastPostId, ScrollTypesEnum? scrollType)
        {
            bool IsPostLikedByCurrentUser;
            var response = new List<GlobalFeedViewModel>();

            var postList = new List<Post>();

            if (lastPostId != null)
            {
                if (scrollType == ScrollTypesEnum.None)
                {

                    var attachment = _postAttachmentRepository.GetById(lastPostId);
                    var posts = await _postRepository.GetAll().Where(x => x.PostType == (int)PostTypeEnum.Reel).ToListAsync();
                    int index = posts.FindIndex(x => x.Id == attachment.PostId);
                    int startIndex = Math.Max(0, index - 3);
                    int totalItems = 7;
                    postList = posts.GetRange(startIndex, Math.Min(totalItems, posts.Count - startIndex));


                }
                if (scrollType == ScrollTypesEnum.Down)
                {
                    var posts = await _postRepository.GetAll().Where(x => x.PostType == (int)PostTypeEnum.Reel).ToListAsync();
                    postList = posts.SkipWhile(x => x.Id != lastPostId).Skip(1).Take(3).ToList();

                }
                if (scrollType == ScrollTypesEnum.Up)
                {
                    var posts = await _postRepository.GetAll().Where(x => x.PostType == (int)PostTypeEnum.Reel).ToListAsync();
                    postList = posts.TakeWhile(x => x.Id != lastPostId).Reverse().Take(3).Reverse().ToList();
                }
            }

            else
            {
                postList = await _postRepository.GetAll().Where(x => x.PostType == (int)postType && ((string.IsNullOrEmpty(searchString)) || (x.Title.Contains(searchString)))).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            }
            var postAttachmentList = await _postAttachmentRepository.GetAll().ToListAsync();
            var postTagsList = await _postTagRepository.GetAll().ToListAsync();
            var likesList = await _likeRepository.GetAll().ToListAsync();
            var sharedPostList = await _userSharedPostRepository.GetAll().ToListAsync();
            var savedPosts = await _savedPostRepository.GetAll().ToListAsync();

            foreach (var item in postList)
            {
                var post = postList.Where(x => x.Id == item.Id).First();
                var postAttachment = postAttachmentList.Where(x => x.PostId == item.Id).ToList();
                var postTag = postTagsList.Where(x => x.PostId == item.Id).ToList();
                var likes = await GetLikesOnPost(post.Id);
                var views = await GetViewsOnPost(post.Id);
                var commentsCount = await GetCommentsCountOnPost(post.Id);
                var sharedPostCount = sharedPostList.Where(x => x.PostId == post.Id).Count();

                var isLiked = likesList.Any(x => x.UserId == loginUserId && x.PostId == post.Id);

                if (isLiked)
                {
                    IsPostLikedByCurrentUser = true;
                }
                else
                {
                    IsPostLikedByCurrentUser = false;
                }
                string parentName = "";
                string parentImageUrl = "";
                string schoolName = "";
                string parentId = "";
                int postAuthorType = 0;
                if (post.PostAuthorType == (int)PostAuthorTypeEnum.School)
                {
                    var school = _schoolRepository.GetById(post.ParentId);
                    parentName = school.SchoolName;
                    parentImageUrl = school.Avatar;
                    postAuthorType = (int)PostAuthorTypeEnum.School;
                    schoolName = "";
                    parentId = school.SchoolId.ToString();
                }
                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Class)
                {

                    var classes = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassId == post.ParentId).FirstOrDefaultAsync();
                    parentName = classes.ClassName;
                    parentImageUrl = classes.Avatar;
                    postAuthorType = (int)PostAuthorTypeEnum.Class;
                    schoolName = classes.School.SchoolName;
                    parentId = classes.ClassId.ToString();
                }
                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Course)
                {
                    var course = await _courseRepository.GetAll().Include(x => x.School).Where(x => x.CourseId == post.ParentId).FirstOrDefaultAsync();
                    parentName = course.CourseName;
                    parentImageUrl = course.Avatar;
                    postAuthorType = (int)PostAuthorTypeEnum.Course;
                    schoolName = course.School.SchoolName;
                    parentId = course.CourseId.ToString();
                }
                if (post.PostAuthorType == (int)PostAuthorTypeEnum.User)
                {
                    var user = _userRepository.GetById(post.ParentId.ToString());
                    parentName = user.FirstName + " " + user.LastName;
                    parentImageUrl = user.Avatar;
                    postAuthorType = (int)PostAuthorTypeEnum.User;
                    schoolName = "";
                    parentId = user.Id;
                }

                var result = new GlobalFeedViewModel()
                {
                    Id = post.Id,
                    Title = post.Title,
                    Description = post.Description,
                    Likes = likes,
                    Views = views,
                    CommentsCount = commentsCount,
                    PostSharedCount = sharedPostCount,
                    IsPostLikedByCurrentUser = IsPostLikedByCurrentUser,
                    PostType = post.PostType,
                    ParentName = parentName,
                    ParentImageUrl = parentImageUrl,
                    PostAuthorType = postAuthorType,
                    SchoolName = schoolName,
                    ParentId = parentId,
                    DateTime = post.DateTime,
                    PostAttachments = _mapper.Map<List<PostAttachmentViewModel>>(postAttachment),
                    PostTags = _mapper.Map<List<PostTagViewModel>>(postTag),
                    CreatedBy = post.CreatedById,
                    IsPostSavedByCurrentUser = savedPosts.Any(x => x.PostId == post.Id && x.UserId == loginUserId),
                    SavedPostsCount = savedPosts.Where(x => x.PostId == post.Id && x.UserId == loginUserId).Count()

                };

                response.Add(result);


            }
            return response.OrderByDescending(x => x.Views.Count()).OrderByDescending(x => x.Likes.Count()).ToList();
        }

        public async Task<Guid> SaveUserPreference(string userId, string preferenceString)
        {

            var isUserPreferenceExist = await _userPreferenceRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();

            if (isUserPreferenceExist != null)
            {
                var DbPreferenceArray = isUserPreferenceExist.PreferenceTokens.Split(' ');
                var inputPreferenceArray = preferenceString.Split(' ');

                if (DbPreferenceArray.Length > 30)
                {
                    var inputPreferenceLength = inputPreferenceArray.Length;
                    preferenceString = string.Join(" ", new HashSet<string>(DbPreferenceArray.Skip(inputPreferenceLength).ToArray().Concat(inputPreferenceArray)));
                }
                else
                {
                    preferenceString = string.Join(" ", new HashSet<string>(DbPreferenceArray.ToArray().Concat(inputPreferenceArray)));
                }
            }

            foreach (var item in Constants.StopWords)
            {
                preferenceString = preferenceString.Replace(" " + item + " ", " ");
            }


            if (isUserPreferenceExist == null)
            {
                var userPreference = new UserPreference
                {
                    UserId = userId,
                    PreferenceTokens = preferenceString

                };
                _userPreferenceRepository.Insert(userPreference);
                _userPreferenceRepository.Save();
                return userPreference.Id;
            }
            else
            {
                isUserPreferenceExist.PreferenceTokens = preferenceString;
                //userPreference.Id = isUserPreferenceExist.Id;
                // no update here
                _userPreferenceRepository.Update(isUserPreferenceExist);
                _userPreferenceRepository.Save();
                return isUserPreferenceExist.Id;

            }
            return new Guid();
        }

        public async Task<int> GetCommentsCountOnPost(Guid postId)
        {
            var CommentsCount = await _commentRepository.GetAll().Where(x => x.GroupName == postId + "_group").ToListAsync();
            return CommentsCount.Count();
        }

        public async Task<UserDetailsViewModel> GetUserByEmail(string email)
        {
            var user = await _userRepository.GetAll().Where(x => x.Email == email).FirstOrDefaultAsync();
            if (user != null)
            {
                var response = _mapper.Map<UserDetailsViewModel>(user);
                return response;
            }
            return null;
        }

        public async Task DeleteSchoolTeacher(Guid schoolId, string userId)
        {
            var teacher = await _teacherRepository.GetAll().Where(x => x.UserId == userId).FirstAsync();

            var schoolTeacher = await _schoolTeacherRepository.GetAll().Where(x => x.SchoolId == schoolId && x.TeacherId == teacher.TeacherId).FirstOrDefaultAsync();

            if (schoolTeacher != null)
            {
                _schoolTeacherRepository.Delete(schoolTeacher.Id);
                _schoolTeacherRepository.Save();
            }

            var classTeacher = await _classTeacherRepository.GetAll().Include(x => x.Class).ThenInclude(y => y.School).Where(y => y.Class.School.SchoolId == schoolId && y.TeacherId == teacher.TeacherId).FirstOrDefaultAsync();


            if (classTeacher != null)
            {
                _classTeacherRepository.Delete(classTeacher.Id);
                _classTeacherRepository.Save();
            }

            var courseTeacher = await _courseTeacherRepository.GetAll().Include(x => x.Course).ThenInclude(y => y.School).Where(y => y.Course.School.SchoolId == schoolId && y.TeacherId == teacher.TeacherId).FirstOrDefaultAsync();


            if (courseTeacher != null)
            {
                _courseTeacherRepository.Delete(courseTeacher.Id);
                _courseTeacherRepository.Save();
            }
        }

        public async Task DeleteSchoolStudent(Guid schoolId, string userId)
        {
            var student = await _studentRepository.GetAll().Where(x => x.UserId == userId).FirstAsync();



            var classStudent = await _classStudentRepository.GetAll().Include(x => x.Class).ThenInclude(y => y.School).Where(y => y.Class.School.SchoolId == schoolId && y.StudentId == student.StudentId).ToListAsync();


            if (classStudent.Count() != 0)
            {
                _classStudentRepository.DeleteAll(classStudent);
                _classStudentRepository.Save();
            }

            var courseStudent = await _courseStudentRepository.GetAll().Include(x => x.Course).ThenInclude(y => y.School).Where(y => y.Course.School.SchoolId == schoolId && y.StudentId == student.StudentId).ToListAsync();


            if (courseStudent.Count() != 0)
            {
                _courseStudentRepository.DeleteAll(courseStudent);
                _courseStudentRepository.Save();
            }
        }

        public async Task ReportFollower(ReportFollowerViewModel model)
        {
            var user = _userManager.GetUsersInRoleAsync("Admin");
            var path = _webHostEnvironment.ContentRootPath;
            var filePath = Path.Combine(path, "Email/report-follower.html");
            var text = System.IO.File.ReadAllText(filePath);
            text = text.Replace("[UserName]", model.UserName);
            text = text.Replace("[ReportReason]", model.ReportReason);

            string callBackUrl = $"{_config["AppUrl"]}/user/userProfile/{model.FollowerId}";
            text = text.Replace("[URL]", callBackUrl);
            await _commonService.SendEmail(new List<string> { user.Result.First().Email }, null, null, "Report User", body: text, null, null);
        }

        public async Task<IEnumerable<GlobalSearchViewModel>> GlobalSearch(string searchString, int pageNumber, int pageSize)
        {
            var users = await _userRepository.GetAll().Where(x => x.FirstName.Contains(searchString) || x.LastName.Contains(searchString) || (x.FirstName + " " + x.LastName).Contains(searchString)).Select(x => new GlobalSearchViewModel()
            {
                Id = new Guid(x.Id),
                Name = x.FirstName + " " + x.LastName,
                Type = (int)PostAuthorTypeEnum.User,
                Avatar = x.Avatar

            }).Take(5).ToListAsync();

            var schools = await _schoolRepository.GetAll().Where(x => x.SchoolName.Contains(searchString)).Select(x => new GlobalSearchViewModel
            {
                Id = x.SchoolId,
                Name = x.SchoolName,
                Type = (int)PostAuthorTypeEnum.School,
                Avatar = x.Avatar
            }).Take(5).ToListAsync();

            var classes = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassName.Contains(searchString)).Select(x => new GlobalSearchViewModel
            {
                Id = x.ClassId,
                Name = x.ClassName,
                SchoolName = x.School.SchoolName,
                Type = (int)PostAuthorTypeEnum.Class,
                Avatar = x.Avatar
            }).Take(5).ToListAsync();


            var courses = await _courseRepository.GetAll().Where(x => x.CourseName.Contains(searchString)).Select(x => new GlobalSearchViewModel
            {
                Id = x.CourseId,
                Name = x.CourseName,
                SchoolName = x.School.SchoolName,
                Type = (int)PostAuthorTypeEnum.Course,
                Avatar = x.Avatar
            }).Take(5).ToListAsync();

            var result = courses.Concat(classes).Concat(schools).Concat(users).OrderBy(x => x.Type).ToList();

            return result;


        }

        public async Task<IEnumerable<GlobalSearchViewModel>> UsersGlobalSearch(string searchString, int pageNumber, int pageSize)
        {
            var users = await _userRepository.GetAll().Where(x => x.FirstName.Contains(searchString) || x.LastName.Contains(searchString) || (x.FirstName + " " + x.LastName).Contains(searchString)).Select(x => new GlobalSearchViewModel()
            {
                Id = new Guid(x.Id),
                Name = x.FirstName + " " + x.LastName,
                Type = (int)PostAuthorTypeEnum.User,
                Avatar = x.Avatar

            }).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();



            return users;


        }

        public async Task SaveUserCertificates(SaveUserCertificateViewModel userCertificates)
        {
            string certificateUrl = "";
            string containerName = this._config.GetValue<string>("Container:SchoolContainer");
            var user = _userRepository.GetById(userCertificates.UserId);
            if (userCertificates.CertificateUrl == null || (userCertificates.CertificateUrl != null && userCertificates.CertificateImage != null))
            {
                certificateUrl = await _blobService.UploadFileAsync(userCertificates.CertificateImage, containerName, false);

            }
            else
            {
                certificateUrl = userCertificates.CertificateUrl;
            }

            //string certificateName = userCertificates.CertificateImage.FileName;

            if (userCertificates.CertificateId != null)
            {
                var editUserCertificate = _userCertificateRepository.GetById(userCertificates.CertificateId);
                editUserCertificate.CertificateName = userCertificates.CertificateName;
                editUserCertificate.Provider = userCertificates.Provider;
                editUserCertificate.IssuedDate = userCertificates.IssuedDate;
                editUserCertificate.CertificateUrl = certificateUrl;
                editUserCertificate.Name = userCertificates.CertificateName;
                editUserCertificate.UserId = userCertificates.UserId;
                editUserCertificate.Description = userCertificates.Description;

                _userCertificateRepository.Update(editUserCertificate);
                _userCertificateRepository.Save();

            }
            else
            {
                var userCertificate = new UserCertificate
                {
                    CertificateName = userCertificates.CertificateName,
                    Provider = userCertificates.Provider,
                    IssuedDate = userCertificates.IssuedDate,
                    CertificateUrl = certificateUrl,
                    Name = userCertificates.CertificateName,
                    UserId = userCertificates.UserId,
                    Description = userCertificates.Description
                };
                _userCertificateRepository.Insert(userCertificate);
                _userCertificateRepository.Save();

            }

        }

        public async Task DeleteUserCertificate(UserCertificateViewModel model)
        {
            var userCertificate = await _userCertificateRepository.GetAll().Where(x => x.UserId == model.UserId && x.CertificateId == model.CertificateId).FirstOrDefaultAsync();

            if (userCertificate != null)
            {
                _userCertificateRepository.Delete(userCertificate.CertificateId);
                _userCertificateRepository.Save();
            }

            var studentCertificate = await _studentCertificateRepository.GetAll().Where(x => x.Id == model.CertificateId).FirstOrDefaultAsync();
            if (studentCertificate != null)
            {
                _studentCertificateRepository.Delete(studentCertificate.Id);
                _studentCertificateRepository.Save();
            }

        }

        public async Task<bool> IsFollowerBan(string userId, string followerId)
        {
            var follower = await _userFollowerRepository.GetAll().Where(x => x.UserId == userId && x.FollowerId == followerId).FirstOrDefaultAsync();

            return follower.IsBan;



        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetMyFeedSliderReels(string userId, Guid lastPostId, ScrollTypesEnum scrollType)
        {
            var requiredResults = new List<Post>();
            var myFeeds = new List<PostDetailsViewModel>();
            var myData = await _userRepository.GetAll().Where(x => x.Id == userId).ToListAsync();
            var mySchoolData = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();
            var myClassData = await _classRepository.GetAll().Include(x => x.School).Where(x => x.CreatedById == userId).ToListAsync();
            var myCourseData = await _courseRepository.GetAll().Include(x => x.School).Where(x => x.CreatedById == userId).ToListAsync();


            // feeds from schools user follow
            var schoolFollowers = await _schoolFollowerRepository.GetAll()
                .Include(x => x.User)
                .Include(x => x.School)
                .Where(x => x.UserId == userId).ToListAsync();

            var userFollowersData = await _userFollowerRepository.GetAll().Include(x => x.User).Where(x => x.FollowerId == userId).ToListAsync();

            var classStudentsData = await _classStudentRepository.GetAll()
                .Include(x => x.Student)
                .Include(x => x.Class)
                .ThenInclude(x => x.School)
                .Where(x => x.Student.UserId == userId).ToListAsync();

            var courseStudentsData = await _courseStudentRepository.GetAll()
                .Include(x => x.Student)
                .Include(x => x.Course)
                .ThenInclude(x => x.School)
                .Where(x => x.Student.UserId == userId).ToListAsync();

            var requiredIds = schoolFollowers.Select(x => new FeedConvertDTO { Id = x.SchoolId, ParentImageUrl = x.School.Avatar, ParentName = x.School.SchoolName, SchoolName = "" }).ToList();
            var testData = userFollowersData.Where(p => p.UserId != string.Empty).Select(x => new FeedConvertDTO { Id = new Guid(x.UserId), ParentImageUrl = x.User.Avatar, ParentName = x.User.FirstName, SchoolName = "" }).ToList();
            requiredIds.AddRange(testData);
            requiredIds.AddRange(classStudentsData.Select(c => new FeedConvertDTO { Id = c.ClassId, ParentImageUrl = c.Class.Avatar, ParentName = c.Class.ClassName, SchoolName = c.Class.School.SchoolName }).ToList());
            requiredIds.AddRange(courseStudentsData.Select(c => new FeedConvertDTO { Id = c.CourseId, ParentImageUrl = c.Course.Avatar, ParentName = c.Course.CourseName, SchoolName = c.Course.School.SchoolName }).ToList());

            requiredIds.AddRange(myData.Select(c => new FeedConvertDTO { Id = new Guid(c.Id), ParentImageUrl = c.Avatar, ParentName = c.FirstName, SchoolName = "" }).ToList());

            requiredIds.AddRange(mySchoolData.Select(c => new FeedConvertDTO { Id = c.SchoolId, ParentImageUrl = c.Avatar, ParentName = c.SchoolName, SchoolName = "" }).ToList());

            requiredIds.AddRange(myClassData.Select(c => new FeedConvertDTO { Id = c.ClassId, ParentImageUrl = c.Avatar, ParentName = c.ClassName, SchoolName = c.School.SchoolName }).ToList());

            requiredIds.AddRange(myCourseData.Select(c => new FeedConvertDTO { Id = c.CourseId, ParentImageUrl = c.Avatar, ParentName = c.CourseName, SchoolName = c.School.SchoolName }).ToList());


            var postList = _postRepository.GetAll().Include(x => x.CreatedBy);
            var test = requiredIds.Where(a => a.Id.HasValue).ToList();


            if (scrollType == ScrollTypesEnum.None)
            {

                var postListData = postList.Include(p => p.CreatedBy).AsEnumerable().Where(x => test.Any(q => q.Id == x.ParentId) && x.PostType == (int)PostTypeEnum.Reel).OrderByDescending(x => x.CreatedOn).ToList();

                var attachment = _postAttachmentRepository.GetById(lastPostId);
                int index = postListData.FindIndex(x => x.Id == attachment.PostId);
                int startIndex = Math.Max(0, index - 3);
                int totalItems = 7;
                requiredResults = postListData.GetRange(startIndex, Math.Min(totalItems, postListData.Count - startIndex));


            }

            if (scrollType == ScrollTypesEnum.Down)
            {
                requiredResults = postList.Include(p => p.CreatedBy).AsEnumerable().Where(x => test.Any(q => q.Id == x.ParentId) && x.PostType == (int)PostTypeEnum.Reel).OrderByDescending(x => x.CreatedOn).ToList().SkipWhile(x => x.Id != lastPostId).Skip(1).Take(3).ToList();

            }
            if (scrollType == ScrollTypesEnum.Up)
            {
                requiredResults = postList.Include(p => p.CreatedBy).AsEnumerable().Where(x => test.Any(q => q.Id == x.ParentId) && x.PostType == (int)PostTypeEnum.Reel).OrderByDescending(x => x.CreatedOn).ToList().TakeWhile(x => x.Id != lastPostId).Reverse().Take(3).Reverse().ToList();

            }

            //var postListData = postList.Include(p => p.CreatedBy).AsEnumerable().Where(x => test.Any(q => q.Id == x.ParentId) && x.PostType == (int)PostTypeEnum.Reel).OrderByDescending(x => x.CreatedOn).ToList();

            var sharedPosts = await _userSharedPostRepository.GetAll().ToListAsync();
            var savedPosts = await _savedPostRepository.GetAll().ToListAsync();


            var resultData = _mapper.Map<List<PostDetailsViewModel>>(requiredResults);
            foreach (var post in resultData)
            {
                var data = requiredIds.FirstOrDefault(x => x.Id == post.ParentId);
                var attachment = await GetAttachmentsByPostId(post.Id);
                post.PostAttachments = attachment;
                post.ParentImageUrl = data.ParentImageUrl;
                post.ParentName = data.ParentName;
                post.Likes = await GetLikesOnPost(post.Id);
                post.Views = await GetViewsOnPost(post.Id);
                post.CommentsCount = await GetCommentsCountOnPost(post.Id);
                post.PostSharedCount = sharedPosts.Where(x => x.PostId == post.Id).Count();
                post.IsPostSavedByCurrentUser = savedPosts.Any(x => x.PostId == post.Id && x.UserId == userId);
                post.SavedPostsCount = savedPosts.Where(x => x.PostId == post.Id && x.UserId == userId).Count();
                post.ParentId = data.Id != null ? data.Id.Value : Guid.Empty;
                post.SchoolName = data.SchoolName;
                if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
                {
                    post.IsPostLikedByCurrentUser = true;
                }
                else
                {
                    post.IsPostLikedByCurrentUser = false;
                }
            }

            foreach (var post in resultData)
            {
                var tags = await GetTagsByPostId(post.Id);
                post.PostTags = tags;
            }

            myFeeds.AddRange(resultData);
            return myFeeds;
        }

        public async Task<IEnumerable<GlobalFeedViewModel>> GetGlobalFeedSliderReels(string userId, Guid lastReelId, ScrollTypesEnum scrollType)
        {

            var tokenList = new List<string>();
            var result = await _userPreferenceRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();

            if (result != null)
            {
                tokenList = result.PreferenceTokens.Split(' ').ToList();

            }
            else
            {
                tokenList = await GetDefaultGlobalfeeds(userId);
            }

            if (tokenList.Count() != 0)
            {
                var PostGUIDScore = await GenericCompareAlgo(String.Join(" ", tokenList), PostTypeEnum.Reel);
                return await GetFeedResult(PostGUIDScore, userId, PostTypeEnum.Reel, 1, 8, null, lastReelId, scrollType);
            }
            else
            {
                return await GetDefaultFeeds(userId, PostTypeEnum.Reel, 1, 8, null, lastReelId, scrollType);
            }

        }


    }

}
