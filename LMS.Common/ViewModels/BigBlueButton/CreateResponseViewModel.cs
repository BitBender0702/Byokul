using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.BigBlueButton
{
    public class Response
    {
        [JsonProperty("returncode")]
        public string Returncode { get; set; }

        [JsonProperty("meetingID")]
        public string MeetingID { get; set; }

        [JsonProperty("internalMeetingID")]
        public string InternalMeetingID { get; set; }

        [JsonProperty("parentMeetingID")]
        public string ParentMeetingID { get; set; }

        [JsonProperty("attendeePW")]
        public string AttendeePW { get; set; }

        [JsonProperty("moderatorPW")]
        public string ModeratorPW { get; set; }

        [JsonProperty("createTime")]
        public long CreateTime { get; set; }

        [JsonProperty("voiceBridge")]
        public int VoiceBridge { get; set; }

        [JsonProperty("dialNumber")]
        public string DialNumber { get; set; }

        [JsonProperty("createDate")]
        public string CreateDate { get; set; }

        [JsonProperty("hasUserJoined")]
        public bool HasUserJoined { get; set; }

        [JsonProperty("duration")]
        public int Duration { get; set; }

        [JsonProperty("hasBeenForciblyEnded")]
        public bool HasBeenForciblyEnded { get; set; }

        [JsonProperty("messageKey")]
        public string MessageKey { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }
        public string StreamUrl { get; set; }
    }

    public class CreateResponse
    {
        [JsonProperty("response")]
        public Response Response { get; set; }
    }


}
