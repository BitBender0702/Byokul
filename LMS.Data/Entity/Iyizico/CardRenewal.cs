using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity.Iyizico
{
    public class CardRenewal
    {
        public Guid Id { get; set; }
        public Guid SchoolId { get; set; }
        public string CardToken { get; set; }
        public string CardUserKey { get; set; }
    }
}
