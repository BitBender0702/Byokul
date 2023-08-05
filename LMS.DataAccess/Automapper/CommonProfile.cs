using AutoMapper;
using LMS.Common.ViewModels.Admin;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.FileStorage;
using LMS.Common.ViewModels.Iyizico;
using LMS.Common.ViewModels.Permission;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.Stripe;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using LMS.Data.Entity.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using File = LMS.Data.Entity.File;

namespace LMS.DataAccess.Automapper
{
    public class CommonProfile:Profile
    {
        public CommonProfile()
        {
            CreateMap<City, CityViewModel>();
            CreateMap<User, UserDetailsViewModel>();
            CreateMap<UserFollower, UserFollowerViewModel>();
            CreateMap<UserFollower, UserFollowingViewModel>();
            CreateMap<User, UserUpdateViewModel>();
            CreateMap<Discipline, DisciplineViewModel>();
            CreateMap<User, RegisteredUsersViewModel>();
            CreateMap<PostTag, PostTagViewModel>();
            CreateMap<Like, LikeViewModel>();
            CreateMap<View, ViewsViewModel>();
            CreateMap<Comment, CommentViewModel>();
            CreateMap<ClassCourseFilter, ClassCourseFilterViewModel>();
            CreateMap<PermissionMaster, PermissionMasterViewModel>();
            CreateMap<UserPermission, UserPermissionViewModel>();
            CreateMap<Folder, FolderViewModel>();
            CreateMap<File, FileViewModel>();
            CreateMap<Transaction, TransactionViewModel>();
            CreateMap<UserSharedPost, PostDetailsViewModel>()
              .ForMember(x => x.IsSharedPostPinned, opt => opt.MapFrom(o => o.IsPinned));
            CreateMap<SchoolTransaction, SchoolTransactionViewModel>();
            CreateMap<ClassCourseTransaction, ClassCourseTransactionViewModel>();


        }
    }
}
