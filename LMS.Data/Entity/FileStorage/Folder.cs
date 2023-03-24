using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class Folder: ActionAudit
    {
        public Guid Id { get; set; }
        public string FolderName { get; set; }
        public Guid ParentId { get; set; }
        public Guid? ParentFolderId { get; set; }
    }
}
