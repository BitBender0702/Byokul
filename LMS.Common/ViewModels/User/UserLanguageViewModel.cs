using LMS.Common.ViewModels.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.User
{
    public class UserLanguageViewModel
    {
        public string? UserId { get; set; }
        public IEnumerable<string> LanguageIds { get; set; }
    }
}
