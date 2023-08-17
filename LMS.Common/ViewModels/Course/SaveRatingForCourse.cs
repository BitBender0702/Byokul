using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Course
{
    public class SaveRatingForCourse
    {
        public Guid CourseId { get; set; }
        [JsonIgnore]
        public string UserId { get; set; }

    }
}
