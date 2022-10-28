using AutoMapper;
using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.School;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Automapper
{
    public class SchoolProfile : Profile
    {
        public SchoolProfile()
        {
            CreateMap<School, SchoolViewModel>()
                 .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.Email));
            CreateMap<SchoolCertificate, SchoolCertificateViewModel>();
            CreateMap<SchoolTag, SchoolTagViewModel>();
            CreateMap<Country, CountryViewModel>();
            CreateMap<Specialization, SpecializationViewModel>();
            CreateMap<Language, LanguageViewModel>();
            CreateMap<SchoolLanguage, SchoolLanguageViewModel>();
            CreateMap<School, SchoolDetailsViewModel>();
            CreateMap<SchoolFollower, SchoolFollowerViewModel>();
            CreateMap<User, UserViewModel>();
            CreateMap<SchoolUser, SchoolUserViewModel>();
        }
    }
}
