﻿using LMS.Common.Enums;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface IPostService
    {
        Task<PostViewModel> SavePost(PostViewModel postViewModel, string createdById);
        Task<PostViewModel> UpdatePost(PostViewModel model, string createdById);
        Task<PostAttachmentViewModel> GetReelById(Guid id, string userId);
        Task<PostDetailsViewModel> GetPostById(Guid id, string userId);
        Task<string> PinUnpinPost(Guid postId, bool isPinned);
        Task<List<LikeViewModel>> LikeUnlikePost(LikeUnlikeViewModel model);
        Task<int> PostView(PostViewsViewModel model);
        Task<bool> LikeUnlikeComment(Guid commentId, bool isLike, string userId);
        Task EnableDisableComments(Guid postId, bool isHideComments);
        Task<bool> SaveUserSharedPost(string userId, Guid postId);
        Task<bool?> SavePostByUser(string userId, Guid postId);
        Task<List<PostDetailsViewModel>> GetSavedPostsByUser(string userId, int pageNumber, PostTypeEnum type);
        Task<List<PostDetailsViewModel>> GetSharedPostsByUser(string userId, int pageNumber, PostTypeEnum type);
        Task<List<PostDetailsViewModel>> GetLikedPostsByUser(string userId, int pageNumber, PostTypeEnum type);
        Task<bool> PinUnpinSavedPost(Guid postId, bool isPinned, string userId);
        //Task<bool> PinUnpinSharedPost(Guid attachmentId, bool isPinned);
        Task<bool> PinUnpinLikedPost(Guid postId, bool isPinned, string userId);
        Task<bool> DeletePost(Guid id);
        Task UpdateCommentThrottling(Guid postId, int noOfComments);
        Task SaveStreamAsPost(Guid postId);
        Task SaveLiveVideoTime(Guid postId, float videoTotalTime, float videoLiveTime);
        Task<List<VideoUploadResponseViewModel>> SaveUploadVideos(IEnumerable<IFormFile> uploadVideos, IEnumerable<IFormFile> uploadVideosThumbnail, Guid postId, string createdById,bool isJobRunning);
        Task<bool> EnableLiveStream(Guid postId);
        Task<IEnumerable<GlobalSearchViewModel>> PostsGlobalSearch(string searchString, int pageNumber, int pageSize);
        Task<List<PostDetailsViewModel>> GetSavedSliderReels(string userId, Guid lastPostId, ScrollTypesEnum scrollType);
        Task<List<PostDetailsViewModel>> GetSharedSliderReels(string userId, Guid lastPostId, ScrollTypesEnum scrollType);
        Task<List<PostDetailsViewModel>> GetLikedSliderReels(string userId, Guid lastPostId, ScrollTypesEnum scrollType);
    }
}
