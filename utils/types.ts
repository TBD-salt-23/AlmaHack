export type EventInput = {
  startWindow: string;
  endWindow: string;
  duration: string;
  title: string;
};
export type StoredValue = {
  title: string;
  duration: string;
  description?: string;
};
export type ApiEvent = {
  description?: string;
  created: string;
  creator: { email: string; self: boolean };
  end: {
    date: string;
    dateTime: string;
    timeZone: string;
  };
  etag: string;
  eventType: string;
  htmlLink: string;
  iCalUID: string;
  id: string;
  kind: string;
  organizer: { email: string; self: boolean };
  reminders: { useDefault: boolean };
  sequence: number;
  start: {
    date: string;
    dateTime: string;
    timeZone: string;
  };
  status: string;
  summary: string;
  updated: string;
};

export type GoogleTime = {
  date?: Date;
  dateTime?: Date;
  timeZone?: string;
};

export type GoogleEventPost = {
  start: GoogleTime;
  end: GoogleTime;
  summary: string;
};

export type CalendarResponse = {
  calendarList: GoogleCalendar[];
  eventList: ApiEvent[];
};

export type Token = {
  name: string;
  email: string;
  picture: string;
  sub: string;
  userRole: string;
  accessToken: string;
  id: string;
  iat: number;
  exp: number;
  jti: string;
};

export type GoogleCalendar = {
  kind: string;
  etag: string;
  id: string;
  summary: string;
  timeZone: string;
  colorId: string;
  backgroundColor: string;
  foregroundColor: string;
  selected: boolean;
  accessRole: string;
  defaultReminders: [[Object]];
  notificationSettings: { notifications: [] };
  primary: boolean;
  conferenceProperties: { allowedConferenceSolutionTypes: [] };
};

export type Slot = {
  start: number;
  end: number;
};
