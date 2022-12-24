using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Admin
{
    public class AdminDashboardViewModel
    {
        public int NoOfRegUsers { get; set; }
        public int NoOfRegSchools { get; set; }
        public int NoOfClasses { get; set; }
        public int NoOfCourses { get; set; }
    }
}
