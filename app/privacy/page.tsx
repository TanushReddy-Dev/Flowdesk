export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '40px auto', padding: '0 20px', color: '#333' }}>
      <h1 style={{ color: '#111' }}>Privacy Policy</h1>
      <p>Last updated: April 2026</p>
      <h2>Overview</h2>
      <p>FlowDesk ("we", "us") is an AI-powered productivity assistant. 
      This policy explains how we handle your data.</p>
      <h2>Data We Access</h2>
      <p>With your permission, FlowDesk accesses your Gmail and Google 
      Calendar data in read-only mode to generate AI summaries.</p>
      <h2>Data Storage</h2>
      <p>We do not store your emails or calendar events. 
      All data is processed in real-time and never saved to any database.</p>
      <h2>Third Party Services</h2>
      <p>We use Google Gemini API to process and summarize your data. 
      No data is shared with any other third parties.</p>
      <h2>Contact</h2>
      <p>For questions, contact: 
      <a href="mailto:reddytanush11@gmail.com" style={{ color: '#6366f1' }}>reddytanush11@gmail.com</a></p>
      <p><a href="/" style={{ color: '#6366f1' }}>← Back to FlowDesk</a></p>
    </div>
  );
}
