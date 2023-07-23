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
        public string? UserId { get; set; }
        public string? Provider { get; set; }
        public DateTime? IssuedDate { get; set; }
        public string? CertificateName { get; set; }
        public string? Description { get; set; }
    }
}
