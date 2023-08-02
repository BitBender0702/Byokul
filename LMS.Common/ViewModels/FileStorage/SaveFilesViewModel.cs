using LMS.Common.Enums;
using LMS.Common.ViewModels.Post;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.FileStorage
{
    public class SaveFilesViewModel
    {
        public FileTypeEnum? FileType { get; set; }
        public Guid? FolderId { get; set; }
        public Guid? ParentId { get; set; }
        public List<IFormFile> Files { get; set; }
        public List<BlobUrlsViewModel> BlobUrls { get; set; }
        public string BlobUrlsJson { get; set; }

    }
}
