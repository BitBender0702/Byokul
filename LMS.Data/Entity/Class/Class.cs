﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class Class : ActionAudit
    {
        public Guid ClassId { get; set; }
        public string ClassName { get; set; }
        public int NoOfStudents { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid? SchoolId { get; set; }
        public School School { get; set; }
        public Guid? ServiceTypeId { get; set; }
        public ServiceType ServiceType { get; set; }
        public string? Description { get; set; }
        public Guid? AccessibilityId { get; set; }
        public Accessibility Accessibility { get; set; }
        public long? Price { get; set; }
        public long? Rating { get; set; }
        public string? Avatar { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string ClassUrl { get; set; }
    }
}
