using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Stripe
{
    public class PayoutViewModel
    {
        public string Amount { get; set; }
        public string AccountNumber { get; set; }
        public string RoutingNumber { get; set; }
        public string AccountHolderName { get; set; }
        public AccountHolderTypeEnum AccountHolderType { get; set; }
        public string Country { get; set; }

    }


    public enum AccountHolderTypeEnum
    {
        Individual = 1,
        Company = 2
    }
}
