using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Iyizico
{
    public class SchoolSubscriptionPlansViewModel
    {
        public Guid Id { get; set; }
        public string PlanName { get; set; }
        public int Amount { get; set; }
        public string PlanReferenceCode { get; set; }
    }
}
