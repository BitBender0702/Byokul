using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Common
{
    public class StorageSpace
    {
        public double AvailableSpace { get; set; }
        public bool IsStorageFullNotification { get; set; }
    }
}
