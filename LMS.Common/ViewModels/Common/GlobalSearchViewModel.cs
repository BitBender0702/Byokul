using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Common
{
    public class GlobalSearchViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? SchoolName { get; set; }
        public int Type { get; set; }
        public string Avatar { get; set; }
        public bool IsPost { get; set; }
        public int? Gender { get; set; }
    }
}
