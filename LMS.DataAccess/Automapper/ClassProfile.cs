using AutoMapper;
using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.ServiceType;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Automapper
{
    public class ClassProfile: Profile
    {
        public ClassProfile()
        {
            CreateMap<Class, ClassViewModel>()
                .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.FirstName + " " + o.CreatedBy.LastName)); ;
            CreateMap<Class, ClassUpdateViewModel>();
            CreateMap<Discipline, DisciplineViewModel>();
            CreateMap<ServiceType, ServiceTypeViewModel>();
            CreateMap<Class, ClassDetailsViewModel>()
                .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.Email));
            CreateMap<Accessibility, AccessibilityViewModel>();
            CreateMap<ClassCertificate, ClassCertificateViewModel>();
        }
    }
}
