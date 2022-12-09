using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class SaveClassCertificateViewModel
    {
        public Guid ClassId { get; set; }
        public List<IFormFile> Certificates { get; set; }
    }
}
