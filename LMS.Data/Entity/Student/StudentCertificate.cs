﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class StudentCertificate:ActionAudit
    {
        public Guid Id { get; set; }
        public string CertificateUrl { get; set; }
        public Guid? StudentId { get; set; }
        public Student Student { get; set; }
        public string? Name { get; set; }
    }
}
