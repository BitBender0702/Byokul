using LMS.Common.ViewModels.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Course
{
    public class CourseLanguageViewModel
    {
        public Guid Id { get; set; }
        public Guid? CourseId { get; set; }
        public CourseViewModel Course { get; set; }
        public Guid? LanguageId { get; set; }
        public LanguageViewModel Language { get; set; }
    }
}
