using Microsoft.AspNetCore.Identity;

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
    }
}
