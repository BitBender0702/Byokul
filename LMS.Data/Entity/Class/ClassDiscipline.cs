using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class ClassDiscipline
    {
        public Guid Id { get; set; }
        public Guid? ClassId { get; set; }
        public Class Class { get; set; }
        public Guid? DisciplineId { get; set; }
        public Discipline Discipline { get; set; }
    }
}
