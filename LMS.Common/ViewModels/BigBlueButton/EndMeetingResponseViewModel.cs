using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace LMS.Common.ViewModels.BigBlueButton
{
    public class EndMeetingResponseViewModel
    {
        [XmlElement("returncode")]
        public string ReturnCode { get; set; }

        [XmlElement("messageKey")]
        public string MessageKey { get; set; }

        [XmlElement("message")]
        public string Message { get; set; }
    }
}
