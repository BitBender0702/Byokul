using LMS.Data.Entity.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class File: ActionAudit
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public FileTypeEnum FileType { get; set; }
        public Guid? FolderId { get; set; }
        public Folder Folder { get; set; }
        public Guid? ParentId { get; set; }
    }

}
