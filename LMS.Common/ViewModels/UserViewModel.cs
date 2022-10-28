using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels
{
    public class UserViewModel
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public DateTime RegisteredOn { get; set; }
        public string? UniqueToken { get; set; }
        public DateTime? TokenCreatedOn { get; set; }
        public List<string> UserRoles { get; set; }
    }
}
