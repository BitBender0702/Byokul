using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class UserSchoolSubscription
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public User User { get; set; }
    }
}
