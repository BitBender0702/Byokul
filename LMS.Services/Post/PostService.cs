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

            if (postViewModel.uploadImages.Count() != 0)
            {
                await SaveUploadImages(postViewModel.uploadImages, postViewModel.Id, createdById);

                //await SavePostAttachments(postViewModel.PostAttachments, postViewModel.Id, createdById);
            }

            if (postViewModel.uploadVideos.Count() != 0)
            {
                await SaveUploadVideos(postViewModel.uploadVideos, postViewModel.Id, createdById);

                //await SavePostAttachments(postViewModel.PostAttachments, postViewModel.Id, createdById);
            }

            if (postViewModel.uploadAttachments.Count() != 0)
            {
                await SaveUploadAttachments(postViewModel.uploadAttachments, postViewModel.Id, createdById);

                //await SavePostAttachments(postViewModel.PostAttachments, postViewModel.Id, createdById);
            }

            if (postViewModel.PostTags.Count() != 0)
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
                postAttachment.FileName = await _blobService.UploadFileAsync(image, containerName);

                var postAttach = new PostAttachment
                {
                    PostId = postId,
                    FileName = postAttachment.FileName,
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
                postAttachment.FileName = await _blobService.UploadFileAsync(video, containerName);

                var postAttach = new PostAttachment
                {
                    PostId = postId,
                    FileName = postAttachment.FileName,
                    FileType= (int)FileTypeEnum.Video,
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
                postAttachment.FileName = await _blobService.UploadFileAsync(attachment, containerName);

                var postAttach = new PostAttachment
                {
                    PostId = postId,
                    FileName = postAttachment.FileName,
                    FileType = (int)FileTypeEnum.Attachment,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow
                };

                _postAttachmentRepository.Insert(postAttach);
                _postAttachmentRepository.Save();
            }
        }


        //async Task SavePostAttachments(IEnumerable<IFormFile> postAttachments, Guid postId, string createdById)
        //{
        //    string containerName = 'posts';
        //    foreach (var attachment in postAttachments)
        //    {
        //        var postAttachment = new PostAttachmentViewModel();
        //        postAttachment.FileName = await _blobService.UploadFileAsync(attachment, containerName);

        //        var postAttach = new PostAttachment
        //        {
        //            PostId = postId,
        //            FileName = postAttachment.FileName,
        //            CreatedById = createdById,
        //            CreatedOn = DateTime.UtcNow
        //        };

        //        _postAttachmentRepository.Insert(postAttach);
        //        _postAttachmentRepository.Save();
        //    }
        //}

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
