using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class Transaction
    {
        public Guid Id { get; set; }
        public string? StripeProductId { get; set; }
        public string? StripeCustomerId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedOn { get; set; }
        public decimal Amount { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }
        public Guid? ClassId { get; set; }
        public Class Class { get; set; }
        public Guid? CourseId { get; set; }
        public Course Course { get; set; }
        public string OwnerId { get; set; }
        public TransactionTypeEnum TransactionType { get; set; }

    }

    public enum TransactionTypeEnum
    {
        OwnedSchoolPayment = 1,
        Withdraw = 2
    }
}
