using LMS.Common.ViewModels.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class VideoLibraryViewModel
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string FileThumbnail { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public BlobUrlsViewModel BlobUrls { get; set; }
        public string BlobUrlsJson { get; set; }
    }
}
