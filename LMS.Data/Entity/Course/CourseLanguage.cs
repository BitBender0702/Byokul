﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity
{
    public class CourseLanguage
    {
        public Guid Id { get; set; }
        public Guid? CourseId { get; set; }
        public Course Course { get; set; }
        public Guid? LanguageId { get; set; }
        public Language Language { get; set; }
    }
}
