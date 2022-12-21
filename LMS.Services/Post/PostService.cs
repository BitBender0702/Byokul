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
        private IGenericRepository<User> _userRepository;
        private readonly IBlobService _blobService;
        private readonly IBigBlueButtonService _bigBlueButtonService;
        private IConfiguration _config;

        public PostService(IMapper mapper, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<User> userRepository, IBlobService blobService, IBigBlueButtonService bigBlueButtonService, IConfiguration config)
        {
            _mapper = mapper;
            _postRepository = postRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _postTagRepository = postTagRepository;
            _schoolRepository = schoolRepository;
            _classRepository = classRepository;
            _userRepository = userRepository;
            _blobService = blobService;
            _bigBlueButtonService = bigBlueButtonService;
            _config = config;
        }
        public async Task<string> SavePost(PostViewModel postViewModel, string createdById)
        {
            //postViewModel.PostTags = JsonConvert.DeserializeObject<string[]>(postViewModel.PostTags.First());

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
                return url;
            }
            return null;
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
                    FileName= video.FileName,
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

        public async Task<PostAttachmentViewModel> GetReelById(Guid id)
        {
            var postAttachment = await _postAttachmentRepository.GetAll()
                .Include(x => x.Post)
                .Include(x => x.CreatedBy)
                .Where(x => x.Id == id).FirstOrDefaultAsync();

            var result = _mapper.Map<PostAttachmentViewModel>(postAttachment);

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

            //if (result.Post.PostAuthorType == (int)PostAuthorTypeEnum.User)
            //{
            //    var user = _userRepository.GetById(result.Post.ParentId);
            //    result.User = _mapper.Map<UserViewModel>(user);
            //}

            return result;
        }
    }
}
