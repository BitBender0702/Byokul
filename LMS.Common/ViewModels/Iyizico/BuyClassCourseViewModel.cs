using LMS.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Iyizico
{
    public class BuyClassCourseViewModel
    {
        public int? paymentMethod { get; set; }
        public string CardNumber { get; set; }
        public string ExpiresOn { get; set; }
        public string SecurityCode { get; set; }
        public string CardHolderName { get; set; }
        public Guid ParentId { get; set; }
        public string ParentName { get; set; }
        public ClassCourseEnum ParentType { get; set; }
        public long Amount { get; set; }
        public string? ConversationId { get; set; }
    }
}
