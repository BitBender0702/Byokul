using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SchoolFollowerViewModel
    {
        public Guid Id { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }  
        public string? UserId { get; set; }
        public UserDetailsViewModel User { get; set; }
        public Boolean IsBan { get; set; }
    }
}
