using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using LMS.Data.Entity.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.User
{
    public class UserDetailsViewModel
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Avatar { get; set; }
        public string? Description { get; set; }
        public Guid? CityId { get; set; }
        public CityViewModel City { get; set; }
        public int? Gender { get; set; }
        public IEnumerable<UserFollowerViewModel> Followers { get; set; }
        public int Followings { get; set; }
        public bool? IsBan { get; set; }
        public string Email { get; set; }
        public bool IsVarified { get; set; }
        public IEnumerable<LanguageViewModel> Languages { get; set; }
        public IEnumerable<SchoolViewModel> SchoolsAsStudent { get; set; }
        public IEnumerable<SchoolViewModel> SchoolsAsTeacher { get; set; }
        public IEnumerable<PostDetailsViewModel> Posts { get; set; }
        public IEnumerable<PostDetailsViewModel> Reels { get; set; }
        public IEnumerable<CertificateViewModel> Certificates { get; set; }
        public string? CountryName { get; set; }
        public string? CityName { get; set; }
        public string? StateName { get; set; }


    }
}
