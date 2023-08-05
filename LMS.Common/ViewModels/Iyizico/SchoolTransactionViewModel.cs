using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Iyizico
{
    public class SchoolTransactionViewModel
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public UserDetailsViewModel User { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public string ConversationId { get; set; }
        public string? PaymentId { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedOn { get; set; }
        public int Status { get; set; }
        public bool IsActive { get; set; }
        public string SubscriptionReferenceCode { get; set; }
        public DateTime SubscriptionStartDate { get; set; }
        public DateTime SubscriptionEndDate { get; set; }
    }
}
