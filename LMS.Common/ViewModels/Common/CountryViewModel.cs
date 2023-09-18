using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Common.ViewModels.Common
{
    public class CountryViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool? IsActive { get; set; }
    }

    public class Countries
    {
        public Name Name { get; set; }
        public string Cca2 { get; set; }
    }

    public class Name
    {
        public string Common { get; set; }
        public string Official { get; set; }

    }

    public class Country
    {
        public string CountryName { get; set; }
        public string CountryCode { get; set; }
    }
    public class Datum
    {
        public string country { get; set; }
        public string iso3 { get; set; }
        public string iso2 { get; set; }
        public List<State> states { get; set; }
    }

    public class CountryResponse
    {
        public bool error { get; set; }
        public string msg { get; set; }
        public List<Datum> data { get; set; }
    }

    public class CitiesResponse
    {
        public List<string> Data { get; set; }
    }

    public class Data
    {
        public string Name { get; set; }
        public string Iso3 { get; set; }
        public List<State> States { get; set; }
    }

    public class StateRoot
    {
        public bool Error { get; set; }
        public string Msg { get; set; }
        public Data Data { get; set; }
    }

    public class State
    {
        public string Name { get; set; }
        public string StateCode { get; set; }
    }

}
