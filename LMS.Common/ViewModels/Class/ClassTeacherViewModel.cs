using LMS.Common.ViewModels.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class ClassTeacherViewModel
    {
        public Guid Id { get; set; }
        public Guid? ClassId { get; set; }
        public ClassViewModel Class { get; set; }
        public Guid? TeacherId { get; set; }
        public TeacherViewModel Teacher { get; set; }
    }
}
