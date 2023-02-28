using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Student
{
    public class UploadStudentCertificateViewModel
    {
        public string CertificateHtml { get; set; }
        public Guid? StudentId { get; set; }
        public string? certificateName { get; set; }
        public List<StudentViewModel> Students { get; set; }
        public string SchoolName { get; set; }
        public string SchoolAvatar { get; set; }
        public string CertificateTitle { get; set; }
        public string CertificateReason { get; set; }
        public String Date { get; set; }
        public string UploadSignatureImage { get; set; }
        public string UploadQrImage { get; set; }
        public string BackgroundImage{ get; set; }


    }
}
