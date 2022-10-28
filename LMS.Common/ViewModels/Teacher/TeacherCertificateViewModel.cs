using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Teacher
{
    public class TeacherCertificateViewModel
    {
        public Guid CertificateId { get; set; }
        public string CertificateUrl { get; set; }
        public Guid TeacherId { get; set; }
        public TeacherViewModel TeacherViewModel { get; set; }
    }
}
