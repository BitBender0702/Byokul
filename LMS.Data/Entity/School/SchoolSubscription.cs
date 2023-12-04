using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class SchoolSubscription : ActionAudit
    {
        public Guid Id { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
        public Guid? SchoolSubscriptionPlanId { get; set; }
        public SchoolSubscriptionPlan SchoolSubscriptionPlan { get; set; }
        public bool IsActive { get; set; }

    }
}
