using LMS.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Post
{
    public class BlobUrlsViewModel
    {
        public Guid Id { get; set; }
        public string BlobUrl { get; set; }
        public FileTypeEnum FileType { get; set; }
        public string BlobName { get; set; }
        public string? FileThumbnail { get; set; }
    }
}
