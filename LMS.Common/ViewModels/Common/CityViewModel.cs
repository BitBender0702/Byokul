using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Common
{
    public class CityViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public CountryViewModel Country { get; set; }
    }
}
