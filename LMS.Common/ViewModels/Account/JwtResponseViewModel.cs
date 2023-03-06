using LMS.Common.ViewModels.Permission;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Account
{
    public class JwtResponseViewModel
    {
        public string Token { get; set; }
        public List<UserPermissionViewModel> UserPermissions { get; set; }
        public string ErrorMessage { get; set; }
    }
}
