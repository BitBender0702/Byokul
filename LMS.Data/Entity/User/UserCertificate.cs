using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class UserCertificate
    {
        [Key]
        public Guid CertificateId { get; set; }
        public string CertificateUrl { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public string? Name { get; set; }
    }
}
