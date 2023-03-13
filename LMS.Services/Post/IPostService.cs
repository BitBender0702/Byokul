using LMS.Common.ViewModels.Post;
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
        Task<PostAttachmentViewModel> GetReelById(Guid id,string userId);
        Task<PostDetailsViewModel> GetPostById(Guid id, string userId);
        Task<bool> PinUnpinPost(Guid attachmentId, bool isPinned);
        Task<List<LikeViewModel>> LikeUnlikePost(LikeUnlikeViewModel model);
        Task<int> PostView(PostViewsViewModel model);
        Task<bool> LikeUnlikeComment(Guid commentId, bool isLike, string userId);
        Task EnableDisableComments(Guid postId, bool isHideComments);
        Task SaveUserSharedPost(string userId, Guid postId);



    }
}
