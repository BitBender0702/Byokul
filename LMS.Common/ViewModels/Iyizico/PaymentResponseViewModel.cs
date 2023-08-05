using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Iyizico
{
    public class PaymentResponseViewModel
    {
        public string PaymentConversationId { get; set; }
        public int MerchantId { get; set; }
        public int PaymentId { get; set; }
        public string Status { get; set; }
        public string IyziReferenceCode { get; set; }
        public string IyziEventType { get; set; }
        public long IyziEventTime { get; set; }
        public int IyziPaymentId { get; set; }
    }
}
