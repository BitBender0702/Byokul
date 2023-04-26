using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Stripe
{
    public class TransactionDetailsViewModel
    {
        public decimal MonthlyIncome { get; set; }
        public int SourceOfIncome { get; set; }
        public bool IsUserHasOwnedSchool { get; set; }
        public List<TransactionViewModel> Transactions { get; set; }
    }
}
