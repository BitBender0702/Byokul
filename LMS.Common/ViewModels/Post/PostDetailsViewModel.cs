using LMS.Common.ViewModels.School;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class PostDetailsViewModel
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public int? Status { get; set; }
        public Guid? OwnerId { get; set; }
        public Guid? AuthorId { get; set; }
        public DateTime? DateTime { get; set; }
        public int PostType { get; set; }
        public string Description { get; set; }
        public int PostAuthorType { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public IEnumerable<PostTagViewModel> PostTags { get; set; }
        public Guid ParentId { get; set; }
        public OwnerViewModel Owner { get; set; }
        public AuthorViewModel Author { get; set; }
        public string? CoverLetter { get; set; }
        public IEnumerable<PostAttachmentViewModel> PostAttachments { get; set; }
        public bool IsPinned { get; set; }
        public string ParentImageUrl { get; set; }
        public string ParentName { get; set; }
        public List<LikeViewModel> Likes { get; set; }
        public List<ViewsViewModel> Views { get; set; }
        public bool IsPostLikedByCurrentUser { get; set; }
        public string SchoolName { get; set; }
        public List<CommentViewModel> Comments { get; set; }
        public int CommentsCount { get; set; }
        public Boolean IsCommentsDisabled { get; set; }
        public int PostSharedCount { get; set; }
        public bool IsPostSharedByCurrentUser { get; set; }
        public bool IsPostSavedByCurrentUser { get; set; }
        public int SavedPostsCount { get; set; }
        public bool IsSavedPostPinned { get; set; }
        public bool IsSharedPostPinned { get; set; }
        public Guid UserSharedPostId { get; set; }
        public bool IsLikedPostPinned { get; set; }
        public int? CommentsPerMinute { get; set; }
        public bool? IsLive { get; set; }
        public bool? IsClassPrivateOrPaid { get; set; }
        public string? StreamUrl { get; set; }
        public string? StreamJoinUrl { get; set; }
        public string? InternalMeetingId { get; set; }
        public Guid? ExternalMeetingId { get; set; }
        public bool? IsPostSchedule { get; set; }
        public DateTime? UpdatedOn { get; set; }


    }
}
