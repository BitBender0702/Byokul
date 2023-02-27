using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Student
{
    public class StudentCertificateViewModel
    {
        public Guid Id { get; set; }
        public string CertificateUrl { get; set; }
        public Guid? StudentId { get; set; }
        public StudentViewModel Student { get; set; }
        public string? Name { get; set; }
    }
}
