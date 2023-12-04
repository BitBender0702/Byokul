using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class SchoolSubscriptionPlan
    {
        public Guid Id { get; set; }
        public string PlanName { get; set; }
        public int Amount { get; set; }
        public Guid PlanReferenceCode { get; set; }
    }
}
