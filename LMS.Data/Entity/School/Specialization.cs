using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class Specialization
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool? IsActive { get; set; }
    }
}
