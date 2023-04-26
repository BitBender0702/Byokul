using LMS.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Stripe
{
    public class BuySubscriptionViewModel
    {
        public string CardNumber { get; set; }
        public string ExpiresOn { get; set; }
        public string SecurityCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Guid ParentId { get; set; }
        public string ParentName { get; set; }
        public ClassCourseEnum ParentType { get; set; }
        public long Amount { get; set; }
    }
}
