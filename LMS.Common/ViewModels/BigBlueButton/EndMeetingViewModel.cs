using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.BigBlueButton
{
    public class EndMeetingViewModel
    {
        public string MeetingId { get; set; }
        public string Password { get; set; }
        public Guid PostId { get; set; }
    }
}
