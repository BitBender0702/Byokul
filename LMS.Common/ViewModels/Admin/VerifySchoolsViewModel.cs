using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Admin
{
    public class VerifySchoolsViewModel
    {
        public Guid SchoolId { get; set; }
        public Boolean IsVerify { get; set; }
    }
}
