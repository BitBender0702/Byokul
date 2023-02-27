using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Student
{
    public class UploadStudentCertificateViewModel
    {
        public string CertificateHtml { get; set; }
        public Guid? StudentId { get; set; }
        public string? certificateName { get; set; }
        //public List<Guid?> StudentIds { get; set; }

        public List<StudentViewModel> Students { get; set; }
        //public Guid? ClassId { get; set; }
        //public string? ClassName { get; set; }
        //public Guid? CourseId { get; set; }
        //public string? CourseName { get; set; }

    }
}
