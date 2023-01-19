using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using AutoMapper;
using LMS.DataAccess.Repository;
using Microsoft.AspNetCore.Http;
using LMS.Services.Blob;
using LMS.Common.Enums;
using LMS.Services.BigBlueButton;
using LMS.Common.ViewModels.BigBlueButton;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.User;
using Newtonsoft.Json;
using LMS.Common.ViewModels.Course;

namespace LMS.Services
{
    public class PostService : IPostService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<Post> _postRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private IGenericRepository<PostTag> _postTagRepository;
        private IGenericRepository<School> _schoolRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<Like> _likeRepository;
        private IGenericRepository<View> _viewRepository;
        private readonly IBlobService _blobService;
        private readonly IUserService _userService;
        private readonly IBigBlueButtonService _bigBlueButtonService;
        private IConfiguration _config;

        public PostService(IMapper mapper, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<User> userRepository, IGenericRepository<Like> likeRpository, IGenericRepository<View> viewRepository, IBlobService blobService, IUserService userService, IBigBlueButtonService bigBlueButtonService, IConfiguration config)
        {
            _mapper = mapper;
            _postRepository = postRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _postTagRepository = postTagRepository;
            _schoolRepository = schoolRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _userRepository = userRepository;
            _likeRepository = likeRpository;
            _viewRepository = viewRepository;
            _blobService = blobService;
            _userService = userService;
            _bigBlueButtonService = bigBlueButtonService;
            _config = config;
        }
        public async Task<PostViewModel> SavePost(PostViewModel postViewModel, string createdById)
        {
            postViewModel.PostTags = JsonConvert.DeserializeObject<string[]>(postViewModel.PostTags.First());

            var post = new Post
            {
                Title = postViewModel.Title,
                Status = postViewModel.Status,
                OwnerId = postViewModel.OwnerId,
                AuthorId = postViewModel.AuthorId,
                DateTime = postViewModel.DateTime,
                PostType = postViewModel.PostType,
                Description = postViewModel.Description,
                PostAuthorType = postViewModel.PostAuthorType,
                ParentId = postViewModel.ParentId,
                CoverLetter = postViewModel.CoverLetter,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow
            };

            _postRepository.Insert(post);
            try
            {
                _postRepository.Save();
                postViewModel.Id = post.Id;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            if (postViewModel.UploadImages != null)
            {
                await SaveUploadImages(postViewModel.UploadImages, postViewModel.Id, createdById);
            }

            if (postViewModel.UploadVideos != null)
            {
                await SaveUploadVideos(postViewModel.UploadVideos, postViewModel.Id, createdById);
            }

            if (postViewModel.UploadAttachments != null)
            {
                await SaveUploadAttachments(postViewModel.UploadAttachments, postViewModel.Id, createdById);
            }

            if (postViewModel.PostTags != null)
            {
                await SavePostTags(postViewModel.PostTags, postViewModel.Id);
            }

            if (postViewModel.PostType == (int)PostTypeEnum.Stream)
            {
                var model = new NewMeetingViewModel();
                model.meetingName = postViewModel.Title;
                var url = await _bigBlueButtonService.Create(model);
                //return url;
            }
            postViewModel.Id = post.Id;
            return postViewModel;
            //return _mapper.Map<PostViewModel>(post);
        }

        async Task SaveUploadImages(IEnumerable<IFormFile> uploadImages, Guid postId, string createdById)
        {
            string containerName = "posts";
            foreach (var image in uploadImages)
            {
                var postAttachment = new PostAttachmentViewModel();
                postAttachment.FileUrl = await _blobService.UploadFileAsync(image, containerName);

                var postAttach = new PostAttachment
                {
                    PostId = postId,
                    FileName = image.FileName,
                    FileUrl = postAttachment.FileUrl,
                    FileType = (int)FileTypeEnum.Image,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow
                };

                _postAttachmentRepository.Insert(postAttach);
                _postAttachmentRepository.Save();
            }
        }

        async Task SaveUploadVideos(IEnumerable<IFormFile> uploadVideos, Guid postId, string createdById)
        {
            string containerName = "posts";
            foreach (var video in uploadVideos)
            {
                var postAttachment = new PostAttachmentViewModel();
                postAttachment.FileUrl = await _blobService.UploadFileAsync(video, containerName);

                var postAttach = new PostAttachment
                {
                    PostId = postId,
                    FileName = video.FileName,
                    FileUrl = postAttachment.FileUrl,
                    FileType = (int)FileTypeEnum.Video,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow
                };

                _postAttachmentRepository.Insert(postAttach);
                _postAttachmentRepository.Save();
            }
        }

        async Task SaveUploadAttachments(IEnumerable<IFormFile> uploadAttachments, Guid postId, string createdById)
        {
            string containerName = "posts";
            foreach (var attachment in uploadAttachments)
            {
                var postAttachment = new PostAttachmentViewModel();
                postAttachment.FileUrl = await _blobService.UploadFileAsync(attachment, containerName);

                var postAttach = new PostAttachment
                {
                    PostId = postId,
                    FileName = attachment.FileName,
                    FileUrl = postAttachment.FileUrl,
                    FileType = (int)FileTypeEnum.Attachment,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow
                };

                _postAttachmentRepository.Insert(postAttach);
                _postAttachmentRepository.Save();
            }
        }

        async Task SavePostTags(IEnumerable<string> postTags, Guid postId)
        {
            foreach (var tagValue in postTags)
            {
                var postTag = new PostTag
                {
                    PostId = postId,
                    PostTagValue = tagValue
                };

                _postTagRepository.Insert(postTag);
                _postTagRepository.Save();

            }
        }

        public async Task<PostAttachmentViewModel> GetReelById(Guid id, string userId)
        {
            var postAttachment = await _postAttachmentRepository.GetAll()
                .Include(x => x.Post)
                .Include(x => x.CreatedBy)
                .Where(x => x.Id == id).FirstOrDefaultAsync();

            var result = _mapper.Map<PostAttachmentViewModel>(postAttachment);
            result.Post.Likes = await _userService.GetLikesOnPost(postAttachment.Post.Id);
            result.Post.Views = await _userService.GetViewsOnPost(postAttachment.Post.Id);

            if (result.Post.Likes.Any(x => x.UserId == userId && x.PostId == postAttachment.Post.Id))
            {
                result.Post.IsPostLikedByCurrentUser = true;
            }
            else
            {
                result.Post.IsPostLikedByCurrentUser = false;
            }

            if (result.Post.PostAuthorType == (int)PostAuthorTypeEnum.School)
            {
                var school = _schoolRepository.GetById(result.Post.ParentId);
                result.School = _mapper.Map<SchoolViewModel>(school);
            }

            if (result.Post.PostAuthorType == (int)PostAuthorTypeEnum.Class)
            {
                var classes = _classRepository.GetById(result.Post.ParentId);
                result.Class = _mapper.Map<ClassViewModel>(classes);
            }
            //if (result.Post.PostAuthorType == (int)PostAuthorTypeEnum.Course)
            //{
            //    var course = _courseRepository.GetById(result.Post.ParentId);
            //    result.Course = _mapper.Map<CourseViewModel>(course);
            //}

            //if (result.Post.PostAuthorType == (int)PostAuthorTypeEnum.User)
            //{
            //    var user = _userRepository.GetById(result.Post.ParentId);
            //    result.User = _mapper.Map<UserDetailsViewModel>(user);
            //}

            return result;
        }

        public async Task<bool> PinUnpinPost(Guid attachmentId, bool isPinned)
        {
            var post = await _postRepository.GetAll().Where(x => x.Id == attachmentId).FirstOrDefaultAsync();

            if (post != null)
            {
                post.IsPinned = isPinned;
                _postRepository.Update(post);
                _postRepository.Save();
                return true;
            }

            return false;


        }

        public async Task<List<LikeViewModel>> LikeUnlikePost(LikeUnlikeViewModel model)
        {

            var userLike = await _likeRepository.GetAll().Where(x => x.UserId == model.UserId && x.PostId == model.PostId).FirstOrDefaultAsync();

            if (userLike != null)
            {
                _likeRepository.Delete(userLike.Id);
                _likeRepository.Save();
                var totalLikes = await _likeRepository.GetAll().Where(x => x.PostId == model.PostId).ToListAsync();
                return _mapper.Map<List<LikeViewModel>>(totalLikes);
            }

            else
            {
                var like = new Like
                {
                    UserId = model.UserId,
                    PostId = model.PostId,
                    DateTime = DateTime.UtcNow,
                    CommentId = model.CommentId == Guid.Empty ? null : model.CommentId,

                };

                _likeRepository.Insert(like);
                _likeRepository.Save();
                var totalLikes = await _likeRepository.GetAll().Where(x => x.PostId == model.PostId).ToListAsync();
                return _mapper.Map<List<LikeViewModel>>(totalLikes);
            }
            return null;
        }

        public async Task<int> PostView(PostViewsViewModel model)
        {
            var isUserViewExist = await _viewRepository.GetAll().Where(x => x.UserId == model.UserId && x.PostId == model.PostId).FirstOrDefaultAsync();
            if (isUserViewExist == null)
            {
                var view = new View
                {
                    UserId = model.UserId,
                    PostId = model.PostId,
                };

                _viewRepository.Insert(view);
                _viewRepository.Save();
                return  _viewRepository.GetAll().Where(x => x.PostId == model.PostId).Count();
            }
            return _viewRepository.GetAll().Where(x => x.PostId == model.PostId).Count();
        }
    }
}
