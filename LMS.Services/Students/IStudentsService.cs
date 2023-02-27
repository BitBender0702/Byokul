using LMS.Common.ViewModels.Student;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Students
{
    public interface IStudentsService
    {
        Task<IEnumerable<StudentViewModel>> GetAllStudents();
        Task ClassGraduateCertificate(string userId, Guid classId, Guid providerId);
        Task SaveClassStudents(Guid classId, Guid studentId);
        Task UploadStudentCertificates(UploadStudentCertificateViewModel model,string userId);
    }
}
