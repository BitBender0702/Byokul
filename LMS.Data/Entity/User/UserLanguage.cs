using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class UserLanguage
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }
        public Guid? LanguageId { get; set; }
        public Language Language { get; set; }
    }
}
