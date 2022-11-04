using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class ClassFollowerViewModel
    {
        public Guid Id { get; set; }
        public Guid? ClassId { get; set; }
        public ClassViewModel Class { get; set; }
        public string? UserId { get; set; }
        public UserViewModel User { get; set; }
    }
}
