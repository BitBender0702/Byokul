using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity.Common
{
    public class SavedClassCourse
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public Guid? ClassId { get; set; }
        public Class Class { get; set; }
        public Guid? CourseId { get; set; }
        public Course Course { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsPinned { get; set; }
    }
}
