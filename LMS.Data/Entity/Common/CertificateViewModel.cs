using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity.Common
{
    public class CertificateViewModel
    {
        public Guid Id { get; set; }
        public string CertificateUrl { get; set; }
        public string? Name { get; set; }
    }
}
