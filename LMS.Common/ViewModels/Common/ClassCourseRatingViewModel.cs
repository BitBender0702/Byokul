using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Common
{
    public class ClassCourseRatingViewModel
    {
        public Guid? CourseId { get; set; }
        public Guid? ClassId { get; set; }
        public string UserId { get; set; }
        public double? Rating { get; set; }
    }
}
