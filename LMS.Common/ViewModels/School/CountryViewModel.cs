using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.School
{
    public class CountryViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool? IsActive { get; set; }
    }
}
