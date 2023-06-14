using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class PostAttachment:ActionAudit
    {
        public Guid Id { get; set; }
        public Guid? PostId { get; set; }
        public Post Post { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public int FileType { get; set; }
        public bool IsPinned { get; set; }
        public string? FileThumbnail { get; set; }
        public float? VideoTotalTime { get; set; }
        public float?  VideoLiveTime { get; set; }

}
}
