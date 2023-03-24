using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.FileStorage
{
    public class FolderViewModel
    {
        public Guid? Id { get; set; }
        public string FolderName { get; set; }
        public Guid ParentId { get; set; }
        public Guid? ParentFolderId { get; set; }
    }
}
