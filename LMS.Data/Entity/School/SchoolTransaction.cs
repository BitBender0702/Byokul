using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class SchoolTransaction
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public User User { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
        public string ConversationId { get; set; }
        public string? PaymentId { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedOn { get; set; }
        public int Status { get; set; }
        public bool IsActive { get; set; }
        public int Amount { get; set; }
        public string SubscriptionReferenceCode { get; set; }
        public DateTime SubscriptionStartDate { get; set; }
        public DateTime SubscriptionEndDate { get; set; }
        public bool IsRefund { get; set; }

    }
}
