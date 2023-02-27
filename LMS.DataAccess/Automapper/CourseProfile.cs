using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Automapper
{
    public class CourseProfile : Profile
    {
        public CourseProfile()
        {
            CreateMap<Course, CourseViewModel>()
                .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.FirstName + " " + o.CreatedBy.LastName))
            .ForMember(x => x.CreatedById, opt => opt.MapFrom(o => o.CreatedById));
            CreateMap<Course, CourseDetailsViewModel>()
                .ForMember(x => x.CreatedBy, opt => opt.MapFrom(o => o.CreatedBy.Email))
                .ForMember(x => x.CreatedById, opt => opt.MapFrom(o => o.CreatedById));
            CreateMap<CourseCertificate, CourseCertificateViewModel>();
            CreateMap<ClassCertificateViewModel, CourseCertificateViewModel>();
            CreateMap<CourseLanguageViewModel, ClassLanguageViewModel>()
               .ForMember(x => x.ClassId, opt => opt.MapFrom(o => o.CourseId));
            CreateMap<CourseTeacherViewModel, ClassTeacherViewModel>()
              .ForMember(x => x.ClassId, opt => opt.MapFrom(o => o.CourseId));
            CreateMap<SaveCourseCertificateViewModel, SaveClassCertificateViewModel>()
              .ForMember(x => x.ClassId, opt => opt.MapFrom(o => o.CourseId));
            CreateMap<CourseCertificateViewModel, ClassCertificateViewModel>()
              .ForMember(x => x.ClassId, opt => opt.MapFrom(o => o.CourseId));
            CreateMap<CourseLike, CourseLikeViewModel>();
            CreateMap<CourseViews, CourseViewsViewModel>();
            CreateMap<Course, CourseInfoForCertificateViewModel>();
        }
    }
}
