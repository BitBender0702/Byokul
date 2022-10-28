using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class ClassLanguage
    {
        public Guid Id { get; set; }
        public Guid? ClassId { get; set; }
        public Class Class { get; set; }
        public Guid? LanguageId { get; set; }
        public Language Language { get; set; }
    }
}
