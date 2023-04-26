using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Stripe
{
    public class TransactionViewModel
    {
        public Guid Id { get; set; }
        public string StripeProductId { get; set; }
        public string StripeCustomerId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedOn { get; set; }
        public decimal Amount { get; set; }
        public string? UserId { get; set; }
        public UserDetailsViewModel User { get; set; }
        //public int SourceOfIncome { get; set; }
        //public decimal MonthlyIncome { get; set; }
        public Guid? ClassId { get; set; }
        public ClassViewModel Class { get; set; }
        public Guid? CourseId { get; set; }
        public CourseViewModel Course { get; set; }
        public string OwnerId { get; set; }
    }
}
