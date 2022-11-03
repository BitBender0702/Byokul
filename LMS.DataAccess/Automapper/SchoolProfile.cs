using AutoMapper;
using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Data.Entity;

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

        }
    }
}
