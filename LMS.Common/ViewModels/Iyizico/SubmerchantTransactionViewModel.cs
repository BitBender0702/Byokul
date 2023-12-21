using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Iyizico
{
    public class SubmerchantTransactionViewModel
    {
        public Guid Id { get; set; }
        public string PaymentTransactionId { get; set; }
        public int PayoutAmount { get; set; }
        public string SubMerchantKey { get; set; }
        public string Message { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
