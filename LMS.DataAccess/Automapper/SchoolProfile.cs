using AutoMapper;
using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;

namespace LMS.DataAccess.Automapper
{
    public class SchoolProfile : Profile
    {
        public SchoolProfile()
        {
            CreateMap<School, SchoolViewModel>()
                 .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.FirstName + " " + o.CreatedBy.LastName));
            CreateMap<School, SchoolUpdateViewModel>()
                .ForMember(x => x.User, opt => opt.MapFrom(o => o.CreatedBy));
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
            CreateMap<Post, PostViewModel>();
            CreateMap<PostAttachment, PostAttachmentViewModel>();
            CreateMap<Post, PostDetailsViewModel>()
                .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.Id));
            CreateMap<School, OwnerViewModel>()
                .ForMember(x => x.OwnerName, opt => opt.MapFrom(o => o.SchoolName));
            CreateMap<User, OwnerViewModel>()
                .ForMember(x => x.OwnerName, opt => opt.MapFrom(o => o.UserName));
            CreateMap<School, AuthorViewModel>()
                .ForMember(x => x.AuthorName, opt => opt.MapFrom(o => o.SchoolName));
            CreateMap<User, AuthorViewModel>()
                .ForMember(x => x.AuthorName, opt => opt.MapFrom(o => o.UserName));
            CreateMap<PostAttachment, PostAttachmentViewModel>()
                .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.Email))
                .ForMember(x => x.User, opt => opt.MapFrom(o => o.CreatedBy));

            CreateMap<SchoolDefaultLogo, SchoolDefaultLogoViewmodel>();

        }
    }
}
