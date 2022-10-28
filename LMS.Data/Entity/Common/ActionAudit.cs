using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class ActionAudit
    {
        public string CreatedById { get; set; }

        [ForeignKey("CreatedById")]
        public User? CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsDeleted { get; set; }
        public string? DeletedById { get; set; }

        [ForeignKey("DeletedById")]
        public User? DeletedBy { get; set; }
        public DateTime? DeletedOn { get; set; }
    }
}
