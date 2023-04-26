using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Stripe
{
    public class TransactionParamViewModel
    {
        public int pageNumber { get; set; }
        public string? SearchString { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        //public TransactionTypeEnum TransactionType { get; set; }
    }
}
