using LMS.Common.ViewModels.Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Iyizico
{
    public class TransactionsDetailsViewModel
    {
        public decimal MonthlyIncome { get; set; }
        public decimal TotalIncome { get; set; }
        public int SourceOfIncome { get; set; }
        public bool IsUserHasOwnedSchool { get; set; }
        public List<SchoolClassCourseTransactionViewModel> OwnedSchoolTransactions { get; set; }
        public List<SchoolClassCourseTransactionViewModel> ClassCourseTransactions { get; set; }
        public List<SchoolClassCourseTransactionViewModel> AllTransactions { get; set; }
        public List<SchoolClassCourseTransactionViewModel> SubmerchantTransactions { get; set; }


    }
}
