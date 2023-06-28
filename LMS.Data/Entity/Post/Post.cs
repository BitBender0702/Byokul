using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class Post:ActionAudit
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public int? Status { get; set; }
        public Guid OwnerId { get; set; }
        public Guid AuthorId { get; set; }
        public DateTime? DateTime { get; set; }
        public int PostType { get; set; }
        public string? Description { get; set; }
        public int PostAuthorType { get; set; }
        public Guid ParentId { get;set; }
        public string? CoverLetter { get; set; }
        public bool IsPinned { get; set; }
        public Boolean IsCommentsDisabled { get; set; }
        public int? CommentsPerMinute { get; set; }
        public bool? IsLive { get; set; }
        public string? StreamUrl { get; set; }
        public string? StreamJoinUrl { get; set; }
        public string? InternalMeetingId { get; set; }
        public Guid? ExternalMeetingId { get; set; }
        public bool? IsPostSchedule { get; set; }

    }
}
