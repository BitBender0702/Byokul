using AutoMapper;
using LMS.Common.ViewModels.Student;
using LMS.Data.Entity;
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
        }
    }
}
