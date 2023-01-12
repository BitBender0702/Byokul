using AutoMapper;
using LMS.Common.ViewModels.Admin;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.User;
using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Automapper
{
    public class CommonProfile:Profile
    {
        public CommonProfile()
        {
            CreateMap<City, CityViewModel>();
            CreateMap<User, UserDetailsViewModel>();
            CreateMap<UserFollower, UserFollowerViewModel>();
            CreateMap<User, UserUpdateViewModel>();
            CreateMap<Discipline, DisciplineViewModel>();
            CreateMap<User, RegisteredUsersViewModel>();
            CreateMap<PostTag, PostTagViewModel>();
            CreateMap<Like, LikeViewModel>();
            CreateMap<View, ViewsViewModel>();
            CreateMap<Comment, CommentViewModel>();

        }
    }
}
