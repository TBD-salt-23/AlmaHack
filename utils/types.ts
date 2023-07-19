export type ApiEvent = {
  created: '2023-07-18T06:35:13.000Z';
  creator: { email: 'karlhugodahlgren@gmail.com'; self: true };
  end: {
    date: string;
    dateTime: '2023-07-24T10:00:00+02:00';
    timeZone: 'Europe/Stockholm';
  };
  etag: '"3379324306825000"';
  eventType: 'default';
  htmlLink: 'https://www.google.com/calendar/event?eid=Xzg4b2pnY2k1NmtzamdiOWs3NHFrY2I5azZjcWowYmEyNnQyazJiOWg2dDI0NGNxNDY0cDM0aGk1NmMga2FybGh1Z29kYWhsZ3JlbkBt';
  iCalUID: 'B182E598-495F-4350-B7EA-17DB3D122FE3';
  id: '_88ojgci56ksjgb9k74qkcb9k6cqj0ba26t2k2b9h6t244cq464p34hi56c';
  kind: 'calendar#event';
  organizer: { email: 'karlhugodahlgren@gmail.com'; self: true };
  reminders: { useDefault: false };
  sequence: 1;
  start: {
    date: string;
    dateTime: '2023-07-24T09:00:00+02:00';
    timeZone: 'Europe/Stockholm';
  };
  status: 'confirmed';
  summary: 'TEST';
  updated: '2023-07-18T06:36:33.765Z';
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

export type Token = {
  name: 'Hugo Dahlgren';
  email: 'karlhugodahlgren@gmail.com';
  picture: 'https://lh3.googleusercontent.com/a/AAcHTtfl8xxXMKUlpRF54gOrJtgYGiL-mejkOloox3jGTL7DjA=s96-c';
  sub: '101588353989906017708';
  userRole: 'admin';
  accessToken: 'ya29.a0AbVbY6Pr6F748FgFoj8WthtQfGSM8Y0yWwRerQkGOFZcpUvTPZUU8qx1z06mVZ7Zb-3cqBmD_QHxOdhnD7l2z8ePTvz1i_g3n9oXCxILlhXcReCVB_odM7sXyMo7GWU9oxYwHB2I0-SFQFKuybh7XV9-CAdIaCgYKAe4SARASFQFWKvPlDLALmUWH2PKMlkK2lCIMIg0163';
  id: '101588353989906017708';
  iat: 1689669206;
  exp: 1692261206;
  jti: '93bdfc20-1a44-448c-b86a-9ed0eda6a79b';
};
