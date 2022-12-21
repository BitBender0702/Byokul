using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
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
        public int Followers { get; set; }
        public int Followings { get; set; }
        public IEnumerable<LanguageViewModel> Languages { get; set; }
        public IEnumerable<SchoolViewModel> SchoolsAsStudent { get; set; }
        public IEnumerable<SchoolViewModel> SchoolsAsTeacher { get; set; }
        public IEnumerable<PostAttachmentViewModel> PostAttachment { get; set; }
        //public IEnumerable<SchoolCertificateViewModel> SchoolCertificates { get; set; }

    }
}
