using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Common
{
    public class BanUnbanStudentModel
    {
        public Guid? ClassId { get; set; }
        public Guid? CourseId { get; set; }
        public Guid? StudentId { get; set; }
        public Guid BannerId { get; set; }
    }
}
