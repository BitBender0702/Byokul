﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class SchoolCertificate
    {
        [Key]
        public Guid CertificateId { get; set; }
        public string CertificateUrl { get; set; }
        public Guid SchoolId { get; set; }
        public School School { get; set; }
        public string? Name { get; set; }
        public string Provider { get; set; }
        public DateTime IssuedDate { get; set; }
        public string CertificateName { get; set; }
        public string? Description { get; set; }
    }
}
