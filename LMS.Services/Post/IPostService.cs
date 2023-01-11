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
        Task<string> SavePost(PostViewModel postViewModel, string createdById);
        Task<PostAttachmentViewModel> GetReelById(Guid id);
        Task<bool> PinUnpinPost(Guid attachmentId, bool isPinned);
        Task<bool> LikeUnlikePost(LikeUnlikeViewModel model);
        Task<bool> PostView(PostViewsViewModel model);

    }
}
