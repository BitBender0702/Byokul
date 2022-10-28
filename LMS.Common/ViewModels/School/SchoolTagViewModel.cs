using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SchoolTagViewModel
    {
        public Guid Id { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel SchoolViewModel { get; set; }
        public string SchoolTagValue { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
    }
}
