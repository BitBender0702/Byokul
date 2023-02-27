using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class ClassInfoForCertificateViewModel
    {
        public Guid ClassId { get; set; }
        public string ClassName { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public List<StudentViewModel> Students { get; set; }
    }
}
