using BigBlueButtonAPI.Core;
using LMS.Common.ViewModels.BigBlueButton;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using System.Xml;

namespace LMS.App.Controllers
{
    [Route("bigBlueButton")]
    public class BigBlueButtonController : Controller
    {
        public string containerName = "Test";
        private IConfiguration _config;
        private readonly IBlobService _blobService;
        private const string JsonArrayNamespace = "http://james.newtonking.com/projects/json";
        public BigBlueButtonController(IConfiguration config,IBlobService blobService)
        {
            _config = config;
            _blobService = blobService;
        }

        [Route("create")]
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] NewMeetingViewModel newMeetingViewModel)
        {
            try
            {
                string baseUrl = this._config.GetValue<string>("BigBlueButtonAPISettings:ServerAPIUrl");
                string secretKey = this._config.GetValue<string>("BigBlueButtonAPISettings:SharedSecret");
                string moderatorPW = "mp";
                string attendeePW = "ap";
                string logoutURL = _config["MeetingLogoutUrl"];

                string meetingId = newMeetingViewModel.meetingName + "meetings";
                meetingId = await EncodeUrl(meetingId);
                string meetingName = newMeetingViewModel.meetingName;
                meetingName = await EncodeUrl(meetingName);
                string welcome = await GetWelcomeMsg(meetingId);

                string createChecksum = "createname=" + meetingName + "&meetingID=" + meetingId + "&welcome=" + welcome + "&attendeePW=" + attendeePW + "&freeJoin=false" + "&record=true" + "&autoStartRecording=true" + "&logoutURL=" + logoutURL + "&guestPolicy=ASK_MODERATOR" + "&moderatorPW=" + moderatorPW + secretKey;

                string checksum = Hash(createChecksum);

                string finalurl = "create?name=" + meetingName + "&meetingID=" + meetingId + "&welcome=" + welcome + "&attendeePW=" + attendeePW + "&freeJoin=false" + "&record=true" + "&autoStartRecording=true" + "&logoutURL=" + logoutURL + "&guestPolicy=ASK_MODERATOR" + "&moderatorPW=" + moderatorPW + "&checksum=" + checksum;

                var clients = new HttpClient();
                clients.BaseAddress = new Uri(baseUrl);
                clients.DefaultRequestHeaders.Accept.Clear();

                //GET Method
                HttpResponseMessage response = await clients.GetAsync(finalurl);
                var responseData = await response.Content.ReadAsStringAsync();

                XmlDocument doc = new XmlDocument();
                doc.LoadXml(responseData);
                string json = JsonConvert.SerializeXmlNode(doc, formatting: Newtonsoft.Json.Formatting.None, omitRootObject: true);
                var result = JsonConvert.DeserializeObject<Response>(json);

                //Join as a moderator
                string fullName = "TestModerator";
                string joinChecksum = "joinfullName=" + fullName + "&meetingID=" + meetingId + "&password=" + moderatorPW + "&redirect=true" + secretKey;

                string joinchecksum = Hash(joinChecksum);
                string joinModeratorUrl = "join?fullName=" + fullName + "&meetingID=" + meetingId + "&password=" + moderatorPW + "&redirect=true" + "&checksum=" + joinchecksum;

                string joinFinalUrl = baseUrl + joinModeratorUrl;
                var res = await RegisterWebHook(meetingId);

                return Ok(new { url = joinFinalUrl });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static string Hash(string checksum)
        {
            return string.Join("", (new SHA1Managed().ComputeHash(Encoding.UTF8.GetBytes(checksum))).Select(x => x.ToString("x2")).ToArray());
        }

        async Task<string> GetWelcomeMsg(string meetingId)
        {
            string callBackUrl = string.Format(_config["JoinMeetingCallback"], meetingId);
            string message = callBackUrl;
            return message;
        }

        public async Task<string> EncodeUrl(string encodeString)
        {
            return encodeString = System.Web.HttpUtility.UrlEncode(encodeString);
        }


        [Route("join")]
        [HttpPost]
        public async Task<ActionResult> Join([FromBody] JoinMeetingViewModel model)
        {
            string baseUrl = this._config.GetValue<string>("BigBlueButtonAPISettings:ServerAPIUrl");
            string secretKey = this._config.GetValue<string>("BigBlueButtonAPISettings:SharedSecret");
            model.MeetingId = await EncodeUrl(model.MeetingId);
            model.Name = await EncodeUrl(model.Name);
            string getMeetingInfoCheckSum = "getMeetingInfomeetingID=" + model.MeetingId + secretKey;

            string getInfoChecksum = Hash(getMeetingInfoCheckSum);
            string getInfoUrl = "getMeetingInfo?meetingID=" + model.MeetingId + "&checksum=" + getInfoChecksum;

            var clients = new HttpClient();
            clients.BaseAddress = new Uri(baseUrl);
            clients.DefaultRequestHeaders.Accept.Clear();

            //GET Method
            HttpResponseMessage response = await clients.GetAsync(getInfoUrl);
            var responseData = await response.Content.ReadAsStringAsync();

            XmlDocument doc = new XmlDocument();
            doc.LoadXml(responseData);

            // change Attendee to List<Attendee>
            var elementsDic = new Dictionary<string, List<string>>();
            elementsDic.Add("attendees", new List<string> { "attendee" });

            foreach (KeyValuePair<string, List<string>> elements in elementsDic)
            {
                foreach (string element in elements.Value)
                {
                    var xmlElements = doc.GetElementsByTagName(element);
                    List<XmlNode> xmlNodeList = new List<XmlNode>();

                    foreach (XmlNode xmlNode in xmlElements)
                    {
                        xmlNodeList.Add(xmlNode);
                    }

                    xmlNodeList = xmlNodeList.FindAll(node => node.ParentNode.Name == elements.Key);

                    if (xmlNodeList.Count == 1)
                    {
                        var attribute = doc.CreateAttribute("json", "Array", JsonArrayNamespace);
                        attribute.InnerText = "true";
                        var node = xmlNodeList[0] as XmlElement;
                        node.Attributes.Append(attribute);
                    }
                }
            }

            var res = XmlDocumentToString(doc);
            string json = JsonConvert.SerializeXmlNode(doc, formatting: Newtonsoft.Json.Formatting.None, omitRootObject: true);
            try
            {
                var result = JsonConvert.DeserializeObject<GetMeetingInfo>(json);

                string joinChecksum = "joinfullName=" + model.Name + "&meetingID=" + model.MeetingId + "&guest=false" + "&password=" + result.attendeePW + "&redirect=true" + secretKey;

                string joinchecksum = Hash(joinChecksum);

                string joinAttendeeUrl = "join?fullName=" + model.Name + "&meetingID=" + model.MeetingId + "&guest=false" + "&password=" + result.attendeePW + "&redirect=true" + "&checksum=" + joinchecksum;

                string joinFinalUrl = baseUrl + joinAttendeeUrl;
                return Ok(new { url = joinFinalUrl });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public string XmlDocumentToString(XmlDocument invoiceXml)
        {
            StringWriter stringWriter = new StringWriter();
            XmlTextWriter textWriter = new XmlTextWriter(stringWriter);
            invoiceXml.WriteTo(textWriter);
            return stringWriter.ToString();
        }


        [HttpPost]
        public async Task<ActionResult> RegisterWebHook(string meetingID)
        {
            string CallBackUrl = "http://localhost:44472/bigBlueButton/callBack";
            CallBackUrl = await EncodeUrl(CallBackUrl);

            string baseUrl = this._config.GetValue<string>("BigBlueButtonAPISettings:ServerAPIUrl");

            string secretKey = this._config.GetValue<string>("BigBlueButtonAPISettings:SharedSecret");


            string webHookChecksum = "hooks/createcallbackURL=" + CallBackUrl + "&meetingID=" + meetingID + "&eventID=rap-post-publish-ended" + "&getRaw=false" + secretKey;

            string webHookchecksum = Hash(webHookChecksum);

            string webhookUrl = "hooks/create?callbackURL=" + CallBackUrl + "&meetingID=" + meetingID + "&eventID=rap-post-publish-ended" + "&getRaw=false" + "&checksum=" + webHookchecksum;

            var clients = new HttpClient();
            clients.BaseAddress = new Uri(baseUrl);
            clients.DefaultRequestHeaders.Accept.Clear();

            HttpResponseMessage response = await clients.GetAsync(webhookUrl);
            var responseData = await response.Content.ReadAsStringAsync();

            return Ok();
        }

        [Route("callBack")]
        [HttpPost]
        [Consumes("application/x-www-form-urlencoded")]
        public async Task<IActionResult> CallBack()
        {
            var formData = Request.Form;
            var list = formData.ToList();
            var result = list.FirstOrDefault().Value.FirstOrDefault();

            var obj = JsonConvert.DeserializeObject<List<MyArray>>(result);

            if (obj.First().data.id == "rap-post-publish-ended")
            {
                var meetingID = obj.First().data.attributes.meeting.InternalMeetingId;
                string recordingUrl = string.Format(_config["RecordingUrl"], meetingID);

                string fileName = meetingID + "File";

                byte[] videoData = null;
                try
                {
                    var wc = new System.Net.WebClient();
                    videoData = wc.DownloadData(recordingUrl);
                    var stream = new MemoryStream(videoData);
                    string videoUrl = await _blobService.UploadVideoAsync(stream, containerName, fileName, "mp4");
                    return Ok();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }

            return Ok();
        }

    }

}
