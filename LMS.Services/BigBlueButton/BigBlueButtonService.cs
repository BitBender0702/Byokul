﻿using LMS.Common.ViewModels.BigBlueButton;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Security.Cryptography;
using LMS.DataAccess.Repository;
using LMS.Data.Entity;
using LMS.Common.ViewModels.Post;

namespace LMS.Services.BigBlueButton
{
    public class BigBlueButtonService : IBigBlueButtonService
    {
        private IConfiguration _config;
        private readonly IGenericRepository<Post> _postRepository;
        private const string JsonArrayNamespace = "http://james.newtonking.com/projects/json";

        public BigBlueButtonService(IConfiguration config, IGenericRepository<Post> postRepository)
        {
            _config = config;
            _postRepository = postRepository;
        }
        public async Task<Response> Create(NewMeetingViewModel newMeetingViewModel)
        {
            try
            {
                string baseUrl = this._config.GetValue<string>("BigBlueButtonAPISettings:ServerAPIUrl");
                string secretKey = this._config.GetValue<string>("BigBlueButtonAPISettings:SharedSecret");
                string moderatorPW = "mp";
                string attendeePW = "ap";
                bool lockSettingsDisableCam = true;
                bool lockSettingsDisableMic = true;
                string logoutURL = _config["MeetingLogoutUrl"];
                bool isMicroPhoneOpen = false;
                string meetingId = Guid.NewGuid().ToString();
                meetingId = await EncodeUrl(meetingId);
                string meetingName = newMeetingViewModel.meetingName;
                meetingName = await EncodeUrl(meetingName);
                string welcome = await GetWelcomeMsg(meetingId);
                if (newMeetingViewModel.IsMicrophoneOpen)
                {
                    isMicroPhoneOpen = true;
                }

                string createChecksum = "createname=" + meetingName + "&meetingID=" + meetingId + "&welcome=" + welcome + "&attendeePW=" + attendeePW + "&freeJoin=false" + "&record=true" + "&autoStartRecording=true" + "&logoutURL=" + logoutURL + "&guestPolicy=ALWAYS_ACCEPT" + "&moderatorPW=" + moderatorPW + "&lockSettingsDisableCam=true" + "&lockSettingsDisableMic=true" + "&userdata-bbb_auto_join_audio=true" + "&userdata-bbb_skip_check_audio=true" + "&userdata-bbb_skip_video_preview=false" + "&userdata-bbb_listen_only_mode=false" + "&userdata-bbb_auto_swap_layout=true" + "&disabledFeatures=presentation" + secretKey;

                string checksum = Hash(createChecksum);

                string finalurl = "create?name=" + meetingName + "&meetingID=" + meetingId + "&welcome=" + welcome + "&attendeePW=" + attendeePW + "&freeJoin=false" + "&record=true" + "&autoStartRecording=true" + "&logoutURL=" + logoutURL + "&guestPolicy=ALWAYS_ACCEPT" + "&moderatorPW=" + moderatorPW + "&lockSettingsDisableCam=true" + "&lockSettingsDisableMic=true" + "&userdata-bbb_auto_join_audio=true" + "&userdata-bbb_skip_check_audio=true" + "&userdata-bbb_skip_video_preview=false" + "&userdata-bbb_listen_only_mode=false" + "&userdata-bbb_auto_swap_layout=true" + "&disabledFeatures=presentation" + "&checksum=" + checksum;

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
                //response.StreamUrl = Uri.EscapeDataString(response.StreamUrl);

                string fullName = Uri.EscapeDataString(newMeetingViewModel.ModeratorName);
                string joinChecksum = "joinfullName=" + fullName + "&meetingID=" + meetingId + "&password=" + moderatorPW + "&redirect=true" + "&lockSettingsDisableCam=true" + "&lockSettingsDisableMic=true" + "&userdata-bbb_auto_join_audio=true" + "&userdata-bbb_skip_check_audio=true" + "&userdata-bbb_skip_video_preview=false" + "&userdata-bbb_listen_only_mode=false" + "&userdata-bbb_auto_swap_layout=true" + "&disabledFeatures=presentation" + secretKey;

                string joinchecksum = Hash(joinChecksum);
                string joinModeratorUrl = "join?fullName=" + fullName + "&meetingID=" + meetingId + "&password=" + moderatorPW + "&redirect=true" + "&lockSettingsDisableCam=true" + "&lockSettingsDisableMic=true" + "&userdata-bbb_auto_join_audio=true" + "&userdata-bbb_skip_check_audio=true" + "&userdata-bbb_skip_video_preview=false" + "&userdata-bbb_listen_only_mode=false" + "&userdata-bbb_auto_swap_layout=true" + "&disabledFeatures=presentation" + "&checksum=" + joinchecksum;

                string joinFinalUrl = baseUrl + joinModeratorUrl;
                result.StreamUrl = joinFinalUrl;
                int hyphenIndex = result.InternalMeetingID.IndexOf('-');
                result.InternalMeetingID = result.InternalMeetingID.Substring(0, hyphenIndex);
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<string> EncodeUrl(string encodeString)
        {
            return encodeString = System.Web.HttpUtility.UrlEncode(encodeString);
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

        public async Task<bool> RegisterWebHook(string meetingID)
        {
            string CallBackUrl = "https://203e-122-160-143-16.ngrok.io/bigBlueButton/callBack";
            CallBackUrl = await EncodeUrl(CallBackUrl);

            string baseUrl = this._config.GetValue<string>("BigBlueButtonAPISettings:ServerAPIUrl");

            string secretKey = this._config.GetValue<string>("BigBlueButtonAPISettings:SharedSecret");


            string webHookChecksum = "hooks/createcallbackURL=" + CallBackUrl + "&meetingID=" + meetingID + "&eventID=rap-publish-ended" + "&getRaw=false" + secretKey;

            string webHookchecksum = Hash(webHookChecksum);

            string webhookUrl = "hooks/create?callbackURL=" + CallBackUrl + "&meetingID=" + meetingID + "&eventID=rap-publish-ended" + "&getRaw=false" + "&checksum=" + webHookchecksum;

            var clients = new HttpClient();
            clients.BaseAddress = new Uri(baseUrl);
            clients.DefaultRequestHeaders.Accept.Clear();

            HttpResponseMessage response = await clients.GetAsync(webhookUrl);
            var responseData = await response.Content.ReadAsStringAsync();

            return true;
        }

        public async Task<string> Join(JoinMeetingViewModel model)
        {

            string baseUrl = this._config.GetValue<string>("BigBlueButtonAPISettings:ServerAPIUrl");
            string secretKey = this._config.GetValue<string>("BigBlueButtonAPISettings:SharedSecret");
            model.MeetingId = await EncodeUrl(model.MeetingId);
            model.Name = await EncodeUrl(model.Name);
            //model.UserId
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

            // remove pass from this

            var res = XmlDocumentToString(doc);
            string json = JsonConvert.SerializeXmlNode(doc, formatting: Newtonsoft.Json.Formatting.None, omitRootObject: true);
            try
            {
                var result = JsonConvert.DeserializeObject<GetMeetingInfo>(json);

                //string joinChecksum = "joinfullName=" + model.Name + "&meetingID=" + model.MeetingId + "&role=VIEWER" + "&redirect=true" + secretKey;

                string joinChecksum = "joinfullName=" + model.Name + "&meetingID=" + model.MeetingId + "&waitModerator=false" + "&password=" + result.attendeePW + "&redirect=true" + "&lockSettingsDisableCam=true" + "&lockSettingsDisableMic=true" + "&userdata-bbb_auto_join_audio=true" + "&userdata-bbb_skip_check_audio=true" + "&userdata-bbb_skip_video_preview=false" + "&userdata-bbb_listen_only_mode=false" + "&userdata-bbb_auto_swap_layout=true" + "&disabledFeatures=presentation" + secretKey;


                string joinchecksum = Hash(joinChecksum);

                string joinAttendeeUrl = "join?fullName=" + model.Name + "&meetingID=" + model.MeetingId + "&waitModerator=false" + "&password=" + result.attendeePW + "&redirect=true" +"&lockSettingsDisableCam=true" + "&lockSettingsDisableMic=true" + "&userdata-bbb_auto_join_audio=true" + "&userdata-bbb_skip_check_audio=true" + "&userdata-bbb_skip_video_preview=false" + "&userdata-bbb_listen_only_mode=false" + "&userdata-bbb_auto_swap_layout=true" + "&disabledFeatures=presentation" + "&checksum=" + joinchecksum;

                string joinFinalUrl = baseUrl + joinAttendeeUrl;
                var post = _postRepository.GetById(model.PostId);
                post.StreamJoinUrl = joinFinalUrl;
                _postRepository.Update(post);
                _postRepository.Save();
                return joinFinalUrl;
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

        public async Task<string> EndMeeting(EndMeetingViewModel model)
        {
            string endMeetingChecksum = "endmeetingID=" + model.MeetingId + "&password=" + model.Password + this._config.GetValue<string>("BigBlueButtonAPISettings:SharedSecret");

            string checksum = Hash(endMeetingChecksum);

            string finalurl = "end?meetingID=" + model.MeetingId + "&password=" + model.Password + "&checksum=" + checksum;
            var clients = new HttpClient();
            clients.BaseAddress = new Uri(this._config.GetValue<string>("BigBlueButtonAPISettings:ServerAPIUrl"));
            clients.DefaultRequestHeaders.Accept.Clear();

            //GET Method
            HttpResponseMessage response = await clients.GetAsync(finalurl);
            var responseData = await response.Content.ReadAsStringAsync();

            XmlDocument doc = new XmlDocument();
            doc.LoadXml(responseData);
            string json = JsonConvert.SerializeXmlNode(doc, formatting: Newtonsoft.Json.Formatting.None, omitRootObject: true);
            var result = JsonConvert.DeserializeObject<Response>(json);

            if (result.Returncode == Constants.EndMeetingSuccess)
            {
                var post = _postRepository.GetById(model.PostId);
                post.IsLive = false;
                _postRepository.Update(post);
                _postRepository.Save();
                return result.Returncode;
            }
            else
            {
                return result.Message;
            }


        }
    }
}
