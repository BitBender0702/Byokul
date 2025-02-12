﻿using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class SaveClassCertificateViewModel
    {
        public Guid ClassId { get; set; }
        public List<IFormFile> Certificates { get; set; }
        public string? Name { get; set; }
        public IFormFile? CertificateImage { get; set; }
        public string? CertificateUrl { get; set; }
        public string Provider { get; set; }
        public DateTime IssuedDate { get; set; }
        public string CertificateName { get; set; }
        public string? Description { get; set; }
        public Guid? CertificateId { get; set; }
    }
}
