using Newtonsoft.Json;

public class Attributes
{
    public Meeting meeting { get; set; }
}

public class Data
{
    public string type { get; set; }
    public string id { get; set; }
    public Attributes attributes { get; set; }
    public Event @event { get; set; }
}

public class Event
{
    public long ts { get; set; }
}

public class Meeting
{
    [JsonProperty("internal-meeting-id")]
    public string InternalMeetingId { get; set; }

    [JsonProperty("external-meeting-id")]
    public string ExternalMeetingId { get; set; }
    public string name { get; set; }

    [JsonProperty("is-breakout")]
    public bool IsBreakout { get; set; }
    public int duration { get; set; }

    [JsonProperty("create-time")]
    public long CreateTime { get; set; }

    [JsonProperty("create-date")]
    public string CreateDate { get; set; }

    [JsonProperty("moderator-pass")]
    public string ModeratorPass { get; set; }

    [JsonProperty("viewer-pass")]
    public string ViewerPass { get; set; }
    public bool record { get; set; }

    [JsonProperty("voice-conf")]
    public string VoiceConf { get; set; }

    [JsonProperty("dial-number")]
    public string DialNumber { get; set; }

    [JsonProperty("max-users")]
    public int MaxUsers { get; set; }
    public Metadata metadata { get; set; }
}

public class Metadata
{
    [JsonProperty("bbb-recording-ready-url")]
    public string BbbRecordingReadyUrl { get; set; }
}

public class MyArray
{
    public Data data { get; set; }
}

public class Root
{
    public List<MyArray> MyArray { get; set; }
}










