using LMS.Common.Enums;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
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
        Task<PostAttachmentViewModel> GetReelById(Guid id, string userId);
        Task<PostDetailsViewModel> GetPostById(Guid id, string userId);
        Task<bool> PinUnpinPost(Guid attachmentId, bool isPinned);
        Task<List<LikeViewModel>> LikeUnlikePost(LikeUnlikeViewModel model);
        Task<int> PostView(PostViewsViewModel model);
        Task<bool> LikeUnlikeComment(Guid commentId, bool isLike, string userId);
        Task EnableDisableComments(Guid postId, bool isHideComments);
        Task SaveUserSharedPost(string userId, Guid postId);
        Task SavePostByUser(string userId, Guid postId);
        Task<List<PostDetailsViewModel>> GetSavedPostsByUser(string userId, int pageNumber, PostTypeEnum type);
        Task<List<PostDetailsViewModel>> GetSharedPostsByUser(string userId, int pageNumber, PostTypeEnum type);
        Task<List<PostDetailsViewModel>> GetLikedPostsByUser(string userId, int pageNumber, PostTypeEnum type);
        Task<bool> PinUnpinSavedPost(Guid attachmentId, bool isPinned, string userId);
        //Task<bool> PinUnpinSharedPost(Guid attachmentId, bool isPinned);
        Task<bool> PinUnpinLikedPost(Guid attachmentId, bool isPinned, string userId);
        Task DeletePost(Guid id);
        Task UpdateCommentThrottling(Guid postId, int noOfComments);
        Task SaveStreamAsPost(Guid postId);
        Task SaveLiveVideoTime(Guid postId, float videoTotalTime, float videoLiveTime);



    }
}
