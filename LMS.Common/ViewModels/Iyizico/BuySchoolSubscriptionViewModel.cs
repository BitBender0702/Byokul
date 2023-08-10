using LMS.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Iyizico
{
    public class BuySchoolSubscriptionViewModel
    {
        public string CardNumber { get; set; }
        public string ExpiresOn { get; set; }
        public string SecurityCode { get; set; }
        public string AccountHolderName { get; set; }
        public string SubscriptionReferenceId { get; set; }
        public Guid SchoolId { get; set; }
        public string? SubscriptionMessage { get; set; }
        public string? ConversationId { get; set; }
        public DateTime? SubscriptionStartDate { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
        public bool? IsInternationalUser { get; set; }

        //public int PlanId { get; set; }
    }
}
