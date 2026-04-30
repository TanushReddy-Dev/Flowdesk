import { google } from "googleapis";

export async function getGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function fetchUnreadEmails(accessToken: string, maxResults = 15) {
  const gmail = await getGmailClient(accessToken);
  const response = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread in:inbox category:primary",
    maxResults,
  });

  const messages = response.data.messages || [];
  const emails = [];

  for (const message of messages) {
    if (!message.id) continue;
    const msgData = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });

    const payload = msgData.data.payload;
    const headers = payload?.headers || [];
    
    const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "No Subject";
    const sender = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "Unknown Sender";
    const date = headers.find((h) => h.name?.toLowerCase() === "date")?.value || "";

    // Extract plain text body
    let bodyText = "";
    if (payload?.parts) {
      const textPart = payload.parts.find(part => part.mimeType === "text/plain");
      if (textPart?.body?.data) {
        bodyText = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      }
    } else if (payload?.body?.data) {
      bodyText = Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    emails.push({
      id: message.id,
      subject,
      sender,
      timestamp: date,
      snippet: msgData.data.snippet || "",
      bodyText: bodyText.substring(0, 1000) // Truncate body to save tokens
    });
  }

  return emails;
}
