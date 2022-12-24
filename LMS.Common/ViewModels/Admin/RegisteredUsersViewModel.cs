using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Admin
{
    public class RegisteredUsersViewModel
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DOB { get; set; }
        public int? Gender { get; set; }
        public string? Description { get; set; }
        public string? ContactEmail { get; set; }
        public string Email { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool? IsBan { get; set; }
        public bool IsVarified { get; set; }
    }
}
