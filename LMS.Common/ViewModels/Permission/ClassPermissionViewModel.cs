﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Permission
{
    public class ClassPermissionViewModel
    {
        public Guid ClassId { get; set; }
        public List<string> PermissionIds { get; set; }
        public Guid? SchoolId { get; set; }
    }
}