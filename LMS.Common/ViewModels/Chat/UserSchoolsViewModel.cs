using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Chat
{
    public class UserSchoolsViewModel
    {
        public Guid SchoolId { get; set; }
        public string SchoolName { get; set; }
        public string? Avatar { get; set; }
        public bool IsVarified { get; set; }
        public int SchoolUnreadMessageCount { get; set; }
        public int TotalSchoolsUnreadMessageCount { get; set; }
    }
}
