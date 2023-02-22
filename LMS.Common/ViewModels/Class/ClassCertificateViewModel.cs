using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class ClassCertificateViewModel
    {
        public Guid ClassId { get; set; }
        public Guid CertificateId { get; set; }
        public string? Name { get; set; }
        public string CertificateUrl { get; set; }
    }
}
