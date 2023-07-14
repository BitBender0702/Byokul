using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.Data.Entity.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Automapper
{
    public class StudentProfile : Profile
    {
        public StudentProfile()
        {
            CreateMap<Student, StudentViewModel>()
                .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.Email));
            CreateMap<StudentCertificate, StudentCertificateViewModel>();
            CreateMap<StudentCertificate, CertificateViewModel>();
            CreateMap<UserCertificate, UserCertificateViewModel>();
            CreateMap<UserCertificate, CertificateViewModel>()
                .ForMember(x => x.Id, opt => opt.MapFrom(o => o.CertificateId));
        }
    }
}
