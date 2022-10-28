using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.SchoolTeacher
{
    public class SchoolTeacherViewModel
    {
        public Guid Id { get; set; }
        public Guid SchoolId { get; set; }
        public SchoolViewModel SchoolViewModel { get; set; }
        public Guid TeacherId { get; set; }
        public TeacherViewModel TeacherViewModel { get; set; }
    }
}
