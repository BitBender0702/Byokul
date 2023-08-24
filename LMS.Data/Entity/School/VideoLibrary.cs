using LMS.Data.Entity.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class VideoLibrary: ActionAudit
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string FileThumbnail { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
    }
}
