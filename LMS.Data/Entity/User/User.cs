using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace LMS.Data.Entity
{
    public class User : IdentityUser
    {
        public DateTime CreatedOn { get; set; }
        public string? UniqueToken { get; set; }
        public DateTime? TokenCreatedOn { get; set; }
        public DateTime? ResetTokenExirationTime { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime? DOB { get; set; }
        public int? Gender { get; set; }
        public bool? IsActive { get; set; }
        public Guid? CityId { get; set; }
        public City City { get; set; }
        public string? Avatar { get; set; }
        public string? Description { get; set; }
        public string? ContactEmail { get; set; }
        public bool IsBan { get; set; }
        public bool IsVarified { get; set; }
        public string? StripeCustomerId { get; set; }
        public string? CountryName { get; set; }
        public string? CityName { get; set; }
        public string? StateName { get; set; }
        public IEnumerable<UserLanguage> UserLanguage { get; set; }
        public string? BlobSasToken { get; set; }
        public DateTime? BlobSasTokenExirationTime { get; set; }


    }
}
