using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class ClassStudent
    {
        public Guid Id { get; set; }
        public Guid? ClassId { get; set; }
        public Class Class { get; set; }
        public Guid? StudentId { get; set; }
        public Student Student { get; set; }
    }
}
