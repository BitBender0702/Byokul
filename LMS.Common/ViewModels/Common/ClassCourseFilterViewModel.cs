using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Common
{
    public class ClassCourseFilterViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public DateTime DateTime { get; set; }
        public FilterTypeEnum FilterType { get; set; }
        public Boolean IsFilterActive { get; set; }
        public int NoOfAppliedFilters { get; set; }
    }
}
