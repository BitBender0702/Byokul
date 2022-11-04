using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Course
{
    public class CourseFollowerViewModel
    {
        public Guid Id { get; set; }
        public Guid? CourseId { get; set; }
        public CourseViewModel Course { get; set; }
        public string? UserId { get; set; }
        public UserViewModel User { get; set; }
    }
}
