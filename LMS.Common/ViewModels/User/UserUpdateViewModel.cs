using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.User
{
    public class UserUpdateViewModel
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Avatar { get; set; }
        public IFormFile AvatarImage { get; set; }
        public DateTime? DOB { get; set; }
        public int? Gender { get; set; }
        public string? Description { get; set; }
        public string? ContactEmail { get; set; }
        public string? CountryName { get; set; }
        public string? CityName { get; set; }
        public string? StateName { get; set; }
        public bool IsBan { get; set; }
    }
}
