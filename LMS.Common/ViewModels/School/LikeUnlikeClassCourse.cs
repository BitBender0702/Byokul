using LMS.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class LikeUnlikeClassCourse
    {
        public Boolean IsLike { get; set; }
        public string? UserId { get; set; }
        public Guid? Id { get; set; }
        public ClassCourseEnum Type { get; set; }
    }
}
