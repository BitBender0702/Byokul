using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class VideoUploadResponseViewModel
    {
        public string VideoUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public bool IsVideo { get; set; }


    }
}
