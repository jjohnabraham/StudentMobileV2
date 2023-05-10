import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsStatesService {
  private states: UsState[] = [
    {
      name: 'Alabama',
      abbreviation: 'AL',
      systateId: 61,
    },
    {
      name: 'Alaska',
      abbreviation: 'AK',
      systateId: 53,
    },
    {
      name: 'Arizona',
      abbreviation: 'AZ',
      systateId: 43,
    },
    {
      name: 'Arkansas',
      abbreviation: 'AR',
      systateId: 26,
    },
    {
      name: 'California',
      abbreviation: 'CA',
      systateId: 9,
    },
    {
      name: 'Colorado',
      abbreviation: 'CO',
      systateId: 45,
    },
    {
      name: 'Connecticut',
      abbreviation: 'CT',
      systateId: 16,
    },
    {
      name: 'Delaware',
      abbreviation: 'DE',
      systateId: 18,
    },
    {
      name: 'Florida',
      abbreviation: 'FL',
      systateId: 1,
    },
    {
      name: 'Georgia',
      abbreviation: 'GA',
      systateId: 2,
    },
    {
      name: 'Hawaii',
      abbreviation: 'HI',
      systateId: 54,
    },
    {
      name: 'Idaho',
      abbreviation: 'ID',
      systateId: 59,
    },
    {
      name: 'Illinois',
      abbreviation: 'IL',
      systateId: 32,
    },
    {
      name: 'Indiana',
      abbreviation: 'IN',
      systateId: 31,
    },
    {
      name: 'Iowa',
      abbreviation: 'IA',
      systateId: 58,
    },
    {
      name: 'Kansas',
      abbreviation: 'KS',
      systateId: 39,
    },
    {
      name: 'Kentucky',
      abbreviation: 'KY',
      systateId: 28,
    },
    {
      name: 'Louisiana',
      abbreviation: 'LA',
      systateId: 25,
    },
    {
      name: 'Maine',
      abbreviation: 'ME',
      systateId: 11,
    },
    {
      name: 'Maryland',
      abbreviation: 'MD',
      systateId: 19,
    },
    {
      name: 'Massachusetts',
      abbreviation: 'MA',
      systateId: 15,
    },
    {
      name: 'Michigan',
      abbreviation: 'MI',
      systateId: 33,
    },
    {
      name: 'Minnesota',
      abbreviation: 'MN',
      systateId: 35,
    },
    {
      name: 'Mississippi',
      abbreviation: 'MS',
      systateId: 24,
    },
    {
      name: 'Missouri',
      abbreviation: 'MO',
      systateId: 55,
    },
    {
      name: 'Montana',
      abbreviation: 'MT',
      systateId: 48,
    },
    {
      name: 'Nebraska',
      abbreviation: 'NE',
      systateId: 38,
    },
    {
      name: 'Nevada',
      abbreviation: 'NV',
      systateId: 60,
    },
    {
      name: 'New Hampshire',
      abbreviation: 'NH',
      systateId: 13,
    },
    {
      name: 'New Jersey',
      abbreviation: 'NJ',
      systateId: 5,
    },
    {
      name: 'New Mexico',
      abbreviation: 'NM',
      systateId: 42,
    },
    {
      name: 'New York',
      abbreviation: 'NY',
      systateId: 4,
    },
    {
      name: 'North Carolina',
      abbreviation: 'NC',
      systateId: 6,
    },
    {
      name: 'North Dakota',
      abbreviation: 'ND',
      systateId: 36,
    },
    {
      name: 'Ohio',
      abbreviation: 'OH',
      systateId: 30,
    },
    {
      name: 'Oklahoma',
      abbreviation: 'OK',
      systateId: 40,
    },
    {
      name: 'Oregon',
      abbreviation: 'OR',
      systateId: 52,
    },
    {
      name: 'Pennsylvania',
      abbreviation: 'PA',
      systateId: 17,
    },
    {
      name: 'Rhode Island',
      abbreviation: 'RI',
      systateId: 14,
    },
    {
      name: 'South Carolina',
      abbreviation: 'SC',
      systateId: 23,
    },
    {
      name: 'South Dakota',
      abbreviation: 'SD',
      systateId: 7,
    },
    {
      name: 'Tennessee',
      abbreviation: 'TN',
      systateId: 27,
    },
    {
      name: 'Texas',
      abbreviation: 'TX',
      systateId: 8,
    },
    {
      name: 'Utah',
      abbreviation: 'UT',
      systateId: 46,
    },
    {
      name: 'Vermont',
      abbreviation: 'VT',
      systateId: 12,
    },
    {
      name: 'Virginia',
      abbreviation: 'VA',
      systateId: 20,
    },
    {
      name: 'Washington',
      abbreviation: 'WA',
      systateId: 50,
    },
    {
      name: 'West Virginia',
      abbreviation: 'WV',
      systateId: 21,
    },
    {
      name: 'Wisconsin',
      abbreviation: 'WI',
      systateId: 34,
    },
    {
      name: 'Wyoming',
      abbreviation: 'WY',
      systateId: 49,
    },
    {
      name: 'District of Columbia',
      abbreviation: 'DC',
      systateId: 51,
    },
    {
      name: 'Puerto Rico',
      abbreviation: 'PR',
      systateId: 10,
    },
    {
      name: 'American Samoa',
      abbreviation: 'AS',
      systateId: 70,
    },
    {
      name: 'Guam',
      abbreviation: 'GU',
      systateId: 62,
    },
    {
      name: 'Northern Mariana Islands',
      abbreviation: 'AS',
      systateId: 89,
    },
    {
      name: 'Virgin Islands',
      abbreviation: 'VI',
      systateId: 57,
    },
  ];

  public getAll() {
    return this.states;
  }
}

export interface UsState {
  name: string;
  abbreviation: string;
  systateId: number;
}
