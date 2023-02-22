using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Course
{
    public class CourseCertificateViewModel
    {
        public Guid CourseId { get; set; }
        public Guid CertificateId { get; set; }
        public string? Name { get; set; }
        public string CertificateUrl { get; set; }
    }
}
