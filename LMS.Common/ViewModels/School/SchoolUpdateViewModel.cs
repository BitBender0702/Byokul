﻿using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.User;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SchoolUpdateViewModel
    {
        public Guid SchoolId { get; set; }
        public string SchoolName { get; set; }
        public string? Avatar { get; set; }
        public IFormFile AvatarImage { get; set; }
        public string? SchoolSlogan { get; set; }
        public DateTime? Founded { get; set; }
        public string? SchoolEmail { get; set; }
        public Guid? AccessibilityId { get; set; }
        public AccessibilityViewModel Accessibility { get; set; }
        public string OwnerId { get; set; }
        public string? Description { get; set; }
        public UserViewModel? User { get; set; }
        public string? CountryName { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsDefaultAvatar { get; set; }
        public string? DialCode { get; set; }
        public string? CountryCode { get; set; }
        public bool IsVarified { get; set; }

    }
}
