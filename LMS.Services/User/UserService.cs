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
using LMS.DataAccess.GenericRepository;
using LMS.DataAccess.Repository;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Country = LMS.Data.Entity.Country;

namespace LMS.Services
{
    public class UserService : IUserService
    {
        public string containerName = "userlogo";
        private readonly IMapper _mapper;
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

        private readonly UserManager<User> _userManager;
        private readonly IBlobService _blobService;
        private readonly IPostRepository _postRepositoryCustom;

        public UserService(IMapper mapper, IGenericRepository<User> userRepository, IGenericRepository<UserFollower> userFollowerRepository, IGenericRepository<UserLanguage> userLanguageRepository, IGenericRepository<City> cityRepository, IGenericRepository<Country> countryRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<CourseTeacher> courseTeacherRepository,
          IGenericRepository<SchoolTeacher> schoolteacherRepository, IGenericRepository<Student> studentRepository, IGenericRepository<Teacher> teacherRepository, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<Post> postRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<UserPreference> userPreferenceRepository, IGenericRepository<Like> likeRepository, IGenericRepository<View> viewRepository, IGenericRepository<Comment> commentRepository, IGenericRepository<StudentCertificate> studentCertificateRepository, IGenericRepository<UserSharedPost> userSharedPostRepository, IGenericRepository<SavedPost> savedPostRepository, UserManager<User> userManager, IBlobService blobService, IPostRepository postRepositoryCustom)
        {
            _mapper = mapper;
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
        }
        public async Task<UserDetailsViewModel> GetUserById(string userId)
        {
            var user = await _userRepository.GetAll().Where(x => x.Id == userId).FirstOrDefaultAsync();
            var result = _mapper.Map<UserDetailsViewModel>(user);
            result.Followers = await GetFollowers(userId);
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
            result.StudentCertificates = await GetCertificateByUser(userId);

            var classCourseTeachers = classTeachers.Union(courseTeachers).DistinctBy(x => x.SchoolId).ToList();

            result.SchoolsAsTeacher = classCourseTeachers.Union(schoolTeachers).DistinctBy(x => x.SchoolId).ToList();

            return result;

        }


        public async Task<List<StudentCertificateViewModel>> GetCertificateByUser(string userId)
        {
            var studentCertificates = await _studentCertificateRepository.GetAll().Include(x => x.Student).Where(x => x.Student.UserId == userId).ToListAsync();
            return _mapper.Map<List<StudentCertificateViewModel>>(studentCertificates);
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
            var followerList = await _userFollowerRepository.GetAll().Where(x => x.UserId == userId).ToListAsync();
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
            user.Avatar = userUpdateViewModel.Avatar;
            user.FirstName = userUpdateViewModel.FirstName;
            user.LastName = userUpdateViewModel.LastName;
            user.DOB = userUpdateViewModel.DOB;
            user.Gender = userUpdateViewModel.Gender;
            user.Description = userUpdateViewModel.Description;
            user.ContactEmail = userUpdateViewModel.ContactEmail;

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
                pageSize = 6;
            }

            if (postType == PostTypeEnum.Reel)
            {
                pageSize = 8;
            }

            var myFeeds = new List<PostDetailsViewModel>();

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


            var postList = _postRepository.GetAll().Include(x => x.CreatedBy);
            var test = requiredIds.Where(a => a.Id.HasValue).ToList();
            var postListData = postList.Include(p => p.CreatedBy).AsEnumerable().Where(x => test.Any(q => q.Id == x.ParentId) && x.PostType == (int)postType && ((string.IsNullOrEmpty(searchString)) || (string.IsNullOrEmpty(x.Title) || (x.Title.ToLower().Contains(searchString.ToLower()))))).Skip((pageNumber - 1) * pageSize).Take(pageSize).OrderByDescending(x => x.IsPinned).ToList();

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


            //foreach (var schoolFollower in schoolFollowers)
            //{
            //    var postList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == schoolFollower.SchoolId && x.PostType == (int)postType).OrderByDescending(x => x.IsPinned).ToListAsync();

            //    var result = _mapper.Map<List<PostDetailsViewModel>>(postList);

            //    foreach (var post in result)
            //    {
            //        var attachment = await GetAttachmentsByPostId(post.Id);
            //        post.PostAttachments = attachment;
            //        post.ParentImageUrl = schoolFollower.School.Avatar;
            //        post.ParentName = schoolFollower.School.SchoolName;
            //        post.Likes = await GetLikesOnPost(post.Id);
            //        post.Views = await GetViewsOnPost(post.Id);
            //        post.PostAuthorType = (int)PostAuthorTypeEnum.School;
            //        post.ParentId = schoolFollower.School.SchoolId;
            //        post.SchoolName = "";
            //        if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
            //        {
            //            post.IsPostLikedByCurrentUser = true;
            //        }
            //        else
            //        {
            //            post.IsPostLikedByCurrentUser = false;
            //        }
            //    }

            //    foreach (var post in result)
            //    {
            //        var tags = await GetTagsByPostId(post.Id);
            //        post.PostTags = tags;
            //    }

            //    myFeeds.AddRange(result);

            //    //var postAttachments = await _postAttachmentRepository.GetAll().Include(x => x.Post).Where(x => x.Post.ParentId == schoolFollower.SchoolId).ToListAsync();

            //    //myFeeds.AddRange(_mapper.Map<List<PostAttachmentViewModel>>(postAttachments));

            //}

            //// posts from people user follow
            //var userFollowers = await _userFollowerRepository.GetAll().Where(x => x.FollowerId == userId).ToListAsync();
            //foreach (var userFollower in userFollowers)
            //{
            //    var postList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == new Guid(userFollower.UserId) && x.PostType == (int)postType).OrderByDescending(x => x.IsPinned).ToListAsync();

            //    var result = _mapper.Map<List<PostDetailsViewModel>>(postList);

            //    foreach (var post in result)
            //    {
            //        var attachment = await GetAttachmentsByPostId(post.Id);
            //        post.PostAttachments = attachment;
            //        post.ParentImageUrl = userFollower.User.Avatar;
            //        post.ParentName = userFollower.User.FirstName + ' ' + userFollower.User.LastName;
            //        post.Likes = await GetLikesOnPost(post.Id);
            //        post.Views = await GetViewsOnPost(post.Id);
            //        post.PostAuthorType = (int)PostAuthorTypeEnum.User;
            //        post.ParentId = new Guid(userFollower.User.Id);
            //        post.SchoolName = "";
            //        if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
            //        {
            //            post.IsPostLikedByCurrentUser = true;
            //        }
            //        else
            //        {
            //            post.IsPostLikedByCurrentUser = false;
            //        }

            //    }

            //    foreach (var post in result)
            //    {
            //        var tags = await GetTagsByPostId(post.Id);
            //        post.PostTags = tags;
            //    }

            //    myFeeds.AddRange(result);


            //}

            ////foreach (var userFollower in userFollowers)
            ////{
            ////    var postAttachments = await _postAttachmentRepository.GetAll().Include(x => x.Post).Where(x => x.Post.ParentId == new Guid(userFollower.UserId)).ToListAsync();

            ////    myFeeds.AddRange(_mapper.Map<List<PostAttachmentViewModel>>(postAttachments));
            ////}

            //// posts from classes user is a student for
            //var classStudents = await _classStudentRepository.GetAll()
            //    .Include(x => x.Student)
            //    .Include(x => x.Class)
            //    .ThenInclude(x => x.School)
            //    .Where(x => x.Student.UserId == userId).ToListAsync();

            //foreach (var classStudent in classStudents)
            //{


            //    var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == classStudent.ClassId && x.PostType == (int)postType).OrderByDescending(x => x.IsPinned).ToListAsync();

            //    var result = _mapper.Map<List<PostDetailsViewModel>>(courseList);

            //    foreach (var post in result)
            //    {
            //        var attachment = await GetAttachmentsByPostId(post.Id);
            //        post.PostAttachments = attachment;
            //        post.ParentImageUrl = classStudent.Class.Avatar;
            //        post.ParentName = classStudent.Class.ClassName;
            //        post.Likes = await GetLikesOnPost(post.Id);
            //        post.Views = await GetViewsOnPost(post.Id);
            //        post.PostAuthorType = (int)PostAuthorTypeEnum.Class;
            //        post.ParentId = classStudent.Class.ClassId;
            //        post.SchoolName = classStudent.Class.School.SchoolName;
            //        if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
            //        {
            //            post.IsPostLikedByCurrentUser = true;
            //        }
            //        else
            //        {
            //            post.IsPostLikedByCurrentUser = false;
            //        }

            //    }

            //    foreach (var post in result)
            //    {
            //        var tags = await GetTagsByPostId(post.Id);
            //        post.PostTags = tags;
            //    }

            //    myFeeds.AddRange(result);


            //}
            ////foreach (var classStudent in classStudents)
            ////{
            ////    var postAttachments = await _postAttachmentRepository.GetAll().Include(x => x.Post).Where(x => x.Post.ParentId == classStudent.ClassId).ToListAsync();

            ////    myFeeds.AddRange(_mapper.Map<List<PostAttachmentViewModel>>(postAttachments));
            ////}



            //// posts from courses user is a student for
            //var courseStudents = await _courseStudentRepository.GetAll()
            //    .Include(x => x.Student)
            //    .Include(x => x.Course)
            //    .ThenInclude(x => x.School)
            //    .Where(x => x.Student.UserId == userId).ToListAsync();

            //foreach (var courseStudent in courseStudents)
            //{


            //    var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == courseStudent.CourseId && x.PostType == (int)postType).OrderByDescending(x => x.IsPinned).ToListAsync();

            //    var result = _mapper.Map<List<PostDetailsViewModel>>(courseList);

            //    foreach (var post in result)
            //    {
            //        var attachment = await GetAttachmentsByPostId(post.Id);
            //        post.PostAttachments = attachment;
            //        post.ParentImageUrl = courseStudent.Course.Avatar;
            //        post.ParentName = courseStudent.Course.CourseName;
            //        post.Likes = await GetLikesOnPost(post.Id);
            //        post.Views = await GetViewsOnPost(post.Id);
            //        post.ParentId = courseStudent.Course.CourseId;
            //        post.PostAuthorType = (int)PostAuthorTypeEnum.Course;
            //        post.SchoolName = courseStudent.Course.School.SchoolName;
            //        if (post.Likes.Any(x => x.UserId == userId && x.PostId == post.Id))
            //        {
            //            post.IsPostLikedByCurrentUser = true;
            //        }
            //        else
            //        {
            //            post.IsPostLikedByCurrentUser = false;
            //        }

            //    }

            //    foreach (var post in result)
            //    {
            //        var tags = await GetTagsByPostId(post.Id);
            //        post.PostTags = tags;
            //    }

            //    myFeeds.AddRange(result);


            //}
            ////foreach (var courseStudent in courseStudents)
            ////{
            ////    var postAttachments = await _postAttachmentRepository.GetAll().Include(x => x.Post).Where(x => x.Post.ParentId == courseStudent.CourseId).ToListAsync();

            ////    myFeeds.AddRange(_mapper.Map<List<PostAttachmentViewModel>>(postAttachments));
            ////}

            return myFeeds;
        }

        public async Task<IEnumerable<PostAttachmentViewModel>> GetUserProfileFeed(string userId)
        {
            var userProfileFeeds = new List<PostAttachmentViewModel>();

            var postAttachments = await _postAttachmentRepository.GetAll().Include(x => x.Post).Where(x => x.Post.CreatedById == userId).ToListAsync();

            userProfileFeeds.AddRange(_mapper.Map<List<PostAttachmentViewModel>>(postAttachments));
            return userProfileFeeds;

        }

        public async Task<UserDetailsViewModel> GetBasicUserInfo(string userId)
        {
            var user = await _userRepository.GetAll().Where(x => x.Id == userId).FirstOrDefaultAsync();

            var response = _mapper.Map<UserDetailsViewModel>(user);
            return response;

        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsByUserId(string userId, int pageNumber = 1, int pageSize = 4)
        {

            var postList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == new Guid(userId) && x.PostType == (int)PostTypeEnum.Post && x.PostAuthorType == (int)PostAuthorTypeEnum.User).OrderByDescending(x => x.IsPinned).ToListAsync();

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
            var reelList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == new Guid(userId) && x.PostType == (int)PostTypeEnum.Reel && x.PostAuthorType == (int)PostAuthorTypeEnum.User).OrderByDescending(x => x.IsPinned).ToListAsync();

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
            return response;

        }

        public async Task<bool> BanFollower(string followerId)
        {
            var follower = await _userFollowerRepository.GetAll().Where(x => x.FollowerId == followerId).FirstOrDefaultAsync();

            if (follower != null)
            {
                follower.IsBan = true;
                _userFollowerRepository.Update(follower);
                _userFollowerRepository.Save();
                return true;
            }

            return false;



        }

        public async Task<IEnumerable<PostAttachmentViewModel>> GetAttachmentsByPostId(Guid postId)
        {
            var attacchmentList = await _postAttachmentRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.PostId == postId).OrderByDescending(x => x.IsPinned).ToListAsync();

            var result = _mapper.Map<List<PostAttachmentViewModel>>(attacchmentList);
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

        public async Task<IEnumerable<GlobalFeedViewModel>> GetGlobalFeed(string userId, PostTypeEnum postType, int pageNumber, string? searchString)
        {
            int pageSize = 0;
            if (postType == PostTypeEnum.Post)
            {
                pageSize = 6;
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
                var PostGUIDScore = await GenericCompareAlgo(String.Join(" ", tokenList), postType, pageNumber, pageSize);
                return await GetFeedResult(PostGUIDScore, userId, postType, pageNumber, pageSize, searchString);
            }
            else
            {
                return await GetDefaultFeeds(userId, postType, pageNumber, pageSize, searchString);
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


        async Task<Dictionary<Guid, double>> GenericCompareAlgo(string tokenList, PostTypeEnum postType, int pageNumber, int pageSize)
        {

            //var DBPostTokens = new List<string>();
            //var PostGUIDScore = new Dictionary<Guid, double>();

            //var listOfPosts = await _postRepository.GetAll().Where(x => x.PostType == (int)postType)
            //    //.Skip((pageNumber - 1) * pageSize).Take(pageSize)
            //    .ToListAsync();
            //var listOfTags = await _postTagRepository.GetAll().ToListAsync();

            //foreach (var post in listOfPosts)
            //{
            //    string item;
            //    var isTags = listOfTags.Where(x => x.PostId == post.Id).ToList();
            //    if (isTags.Count() != 0)
            //    {
            //        item = post.Title == null ? "" : post.Title.Concat(post.Description == null ? "" : post.Description).Concat(String.Join(' ', isTags)).ToString();
            //        //DBPostTokens.Add(item.ToString());
            //    }

            //    else
            //    {
            //        //item = post.Title == null ? "" : post.Title.Concat(post.Description == null ? "" : post.Description).ToString();
            //        item = post.Title == null ? "" : string.Concat(post.Title, post.Description == null ? "" : post.Description);

            //        //DBPostTokens.Add(item.ToString());
            //    }

            //    var hash1 = tokenList.GetHashCode(StringComparison.OrdinalIgnoreCase);
            //    var hash2 = item.GetHashCode(StringComparison.OrdinalIgnoreCase);

            //    var score = Math.Abs(hash1 - hash2);
            //    PostGUIDScore.Add(post.Id, score);
            //    //var FriendsPreferenceString = GetNFriendsPreferences(UserGUID);

            //}
            ////only Post Table, Top Sorted ( by date ) N Posts

            //var a = PostGUIDScore.OrderBy(x => x.Value).ToDictionary(x => x.Key, x => x.Value);
            //return a;

            var DBPostTokens = new List<string>();
            var PostGUIDScore = new Dictionary<Guid, double>();
            var PostGUIDScore2 = new Dictionary<Guid, int>();


            var listOfPosts = await _postRepository.GetAll().Where(x => x.PostType == (int)postType)
                //.Skip((pageNumber - 1) * pageSize).Take(pageSize)
                .ToListAsync();
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

            var result = PostGUIDScore.OrderByDescending(x => x.Value).ToDictionary(x => x.Key, x => x.Value); ;
            return result;

        }

        async Task<List<GlobalFeedViewModel>> GetFeedResult(Dictionary<Guid, double> postGUIDScore, string loginUserId, PostTypeEnum postType, int pageNumber, int pageSize, string? searchString)
        {
            bool IsPostLikedByCurrentUser;
            var response = new List<GlobalFeedViewModel>();

            var requiredPostIds = postGUIDScore.Keys.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToArray();
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

        async Task<List<GlobalFeedViewModel>> GetDefaultFeeds(string loginUserId, PostTypeEnum postType, int pageNumber, int pageSize, string? searchString)
        {
            bool IsPostLikedByCurrentUser;
            var response = new List<GlobalFeedViewModel>();
            var postList = await _postRepository.GetAll().Where(x => x.PostType == (int)postType && ((string.IsNullOrEmpty(searchString)) || (x.Title.Contains(searchString)))).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
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
                //var likeCount = likeList.Where(x => x.PostId == item.Id).Count();
                //var viewCount = viewList.Where(x => x.PostId == item.Id).Count();


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


            var userPreference = new UserPreference
            {
                UserId = userId,
                PreferenceTokens = preferenceString

            };

            if (isUserPreferenceExist == null)
            {
                _userPreferenceRepository.Insert(userPreference);
                _userPreferenceRepository.Save();
            }
            else
            {
                userPreference.Id = isUserPreferenceExist.Id;
                // no update here
                _userPreferenceRepository.Update(userPreference);
                _userPreferenceRepository.Save();

            }
            return userPreference.Id;
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



            var classStudent = await _classStudentRepository.GetAll().Include(x => x.Class).ThenInclude(y => y.School).Where(y => y.Class.School.SchoolId == schoolId && y.StudentId == student.StudentId).FirstOrDefaultAsync();


            if (classStudent != null)
            {
                _classStudentRepository.Delete(classStudent.Id);
                _classStudentRepository.Save();
            }

            var courseStudent = await _courseStudentRepository.GetAll().Include(x => x.Course).ThenInclude(y => y.School).Where(y => y.Course.School.SchoolId == schoolId && y.StudentId == student.StudentId).FirstOrDefaultAsync();


            if (courseStudent != null)
            {
                _courseStudentRepository.Delete(courseStudent.Id);
                _courseStudentRepository.Save();
            }
        }



        //public async Task<UserDetailsViewModel> SearchUserFollowers(string searchString)
        //{

        //}

    }

}
