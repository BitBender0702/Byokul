using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SchoolCertificateViewModel
    {
        public Guid CertificateId { get; set; }
        public string CertificateUrl { get; set; }
        public Guid SchoolId { get; set; }
        public SchoolViewModel SchoolViewModel { get; set; }
    }
}
