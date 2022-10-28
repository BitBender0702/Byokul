using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class StudentCertificate
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
        public Guid? StudentId { get; set; }
        public Student Student { get; set; }
        public string ProviderName { get; set; }
        public string StudentName { get; set; }
        public  DateTime IssueDate { get; set; }
        public string Description { get; set; }
        public string CertificateUrl { get; set; }
    }
}
