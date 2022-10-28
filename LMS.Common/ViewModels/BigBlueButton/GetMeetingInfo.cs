using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.BigBlueButton
{
    public class Attendee
    {
        public string userID { get; set; }
        public string fullName { get; set; }
        public string role { get; set; }
        public string isPresenter { get; set; }
        public string isListeningOnly { get; set; }
        public string hasJoinedVoice { get; set; }
        public string hasVideo { get; set; }
        public string clientType { get; set; }
    }

    public class Attendees
    {
        public List<Attendee>  attendee { get; set; }
    }

    public class GetMeetingInfo
    {
        public string returncode { get; set; }
        public string meetingName { get; set; }
        public string meetingID { get; set; }
        public string internalMeetingID { get; set; }
        public string createTime { get; set; }
        public string createDate { get; set; }
        public string voiceBridge { get; set; }
        public string dialNumber { get; set; }
        public string attendeePW { get; set; }
        public string moderatorPW { get; set; }
        public string running { get; set; }
        public string duration { get; set; }
        public string hasUserJoined { get; set; }
        public string recording { get; set; }
        public string hasBeenForciblyEnded { get; set; }
        public string startTime { get; set; }
        public string endTime { get; set; }
        public string participantCount { get; set; }
        public string listenerCount { get; set; }
        public string voiceParticipantCount { get; set; }
        public string videoCount { get; set; }
        public string maxUsers { get; set; }
        public string moderatorCount { get; set; }
        public Attendees attendees { get; set; }
        public string metadata { get; set; }
        public string isBreakout { get; set; }
    }

}
