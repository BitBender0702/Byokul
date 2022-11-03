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

namespace LMS.Services
{
    public class PostService : IPostService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<Post> _postRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private IGenericRepository<PostTag> _postTagRepository;
        private readonly IBlobService _blobService;
        private readonly IBigBlueButtonService _bigBlueButtonService;
        private IConfiguration _config;

        public PostService(IMapper mapper, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<PostTag> postTagRepository, IBlobService blobService, IBigBlueButtonService bigBlueButtonService, IConfiguration config)
        {
            _mapper = mapper;
            _postRepository = postRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _postTagRepository = postTagRepository;
            _blobService = blobService;
            _bigBlueButtonService = bigBlueButtonService;
            _config = config;
        }
        public async Task<string> SavePost(PostViewModel postViewModel, string createdById)
        {
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
            _postRepository.Save();
            postViewModel.Id = post.Id;

            if (postViewModel.PostAttachments != null)
            {
                await SavePostAttachments(postViewModel.PostAttachments, postViewModel.Id, createdById);
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

        async Task SavePostAttachments(IEnumerable<IFormFile> postAttachments, Guid postId, string createdById)
        {
            string containerName = this._config.GetValue<string>("MyConfig:Container");
            foreach (var attachment in postAttachments)
            {
                var postAttachment = new PostAttachmentViewModel();
                postAttachment.Attachment = await _blobService.UploadFileAsync(attachment, containerName);

                var postAttach = new PostAttachment
                {
                    PostId = postId,
                    FileName = postAttachment.Attachment,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow
                };

                _postAttachmentRepository.Insert(postAttach);
                _postAttachmentRepository.Save();
            }
        }

        async Task SavePostTags(IEnumerable<PostTagViewModel> postTagViewModel, Guid postId)
        {
            foreach (var tag in postTagViewModel)
            {
                var postTag = new PostTag
                {
                    PostId = postId,
                    PostTagValue = tag.PostTagValue
                };

                _postTagRepository.Insert(postTag);
                _postTagRepository.Save();

            }
        }
    }
}
