using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Iyizico
{
    public class ThreeDCallbackViewModel
    {
        public string Status { get; set; }

        public string? PaymentId { get; set; }

        public string? ConversationData { get; set; }
        public long ConversationId { get; set; }

        public string MdStatus { get; set; }
    }
}
