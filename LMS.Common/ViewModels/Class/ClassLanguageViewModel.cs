using LMS.Common.ViewModels.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Class
{
    public class ClassLanguageViewModel
    {
        public Guid Id { get; set; }
        public Guid? ClassId { get; set; }
        public ClassViewModel Class { get; set; }
        public Guid? LanguageId { get; set; }
        public LanguageViewModel Language { get; set; }
    }
}
