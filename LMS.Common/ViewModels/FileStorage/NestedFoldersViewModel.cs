using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.FileStorage
{
    public class NestedFoldersViewModel
    {
        public NestedFoldersViewModel()
        {
            Folders = new();
            Files = new();
        }
        public List<FolderViewModel> Folders { get; set; }
        public List<FileViewModel> Files { get; set; }
    }
}
