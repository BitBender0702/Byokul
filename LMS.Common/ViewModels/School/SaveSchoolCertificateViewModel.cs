﻿using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SaveSchoolCertificateViewModel
    {
        public Guid SchoolId { get; set; }
        //public string? Name { get; set; }
        public List<IFormFile> Certificates { get; set; }
    }
}