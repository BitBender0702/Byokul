using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class ClassCourseFilter
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public DateTime DateTime { get; set; }
        public FilterTypeEnum FilterType { get; set; }
    }

    public enum FilterTypeEnum
    {
        Live = 1,
        Scheduled = 2,
        Free = 3,
        Paid = 4,
        Name = 5,
        ForBeginners = 6,
        MostStudents = 7,
        MostViewed = 8,
        TopRated = 9
    }


}
