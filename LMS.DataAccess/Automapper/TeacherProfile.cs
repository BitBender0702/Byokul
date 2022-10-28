using AutoMapper;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Automapper
{
    public class TeacherProfile:Profile
    {
        public TeacherProfile()
        {
            CreateMap<TeacherCertificate, TeacherCertificateViewModel>();
            CreateMap<Teacher, TeacherViewModel>();
        }
    }
}
