using LMS.Common.ViewModels.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class SchoolLanguageViewModel
    {
        public Guid Id { get; set; }
        public Guid? SchoolId { get; set; }
        public SchoolViewModel School { get; set; }
        public Guid? LanguageId { get; set; }
        public LanguageViewModel Language { get; set; }
    }
}
