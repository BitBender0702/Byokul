﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.BigBlueButton
{
    public class NewMeetingViewModel
    {
        public string meetingName { get; set; }
        public bool IsMicrophoneOpen { get; set; }
        public string ModeratorName { get; set; }
        public Guid PostId { get; set; }
    }
}
