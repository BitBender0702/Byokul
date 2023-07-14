using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.User
{
    public class SaveUserCertificateViewModel
    {
        public string UserId { get; set; }
        public List<IFormFile> Certificates { get; set; }
    }
}
