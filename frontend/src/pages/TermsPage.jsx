export function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <a href="/" className="text-sm text-emerald-500 hover:underline">← KacipLuhh</a>
          <h1 className="text-2xl font-bold text-zinc-100 mt-4">Terms of Service</h1>
          <p className="text-sm text-zinc-500 mt-1">Kemaskini: 30 May 2026</p>
        </div>

        <Section title="Acceptance">
          <p>By creating or joining a room on KacipLuhh, you agree to these Terms. If you do not agree, do not use KacipLuhh.</p>
        </Section>

        <Section title="Acceptable use">
          <p>You must not use KacipLuhh to:</p>
          <ul>
            <li>Share, distribute, or discuss illegal content of any kind</li>
            <li>Harass, threaten, or abuse other users</li>
            <li>Impersonate real persons in nicknames or room names</li>
            <li>Engage in fraud, scams, or deceptive practices</li>
            <li>Violate any applicable laws, including Malaysia's Communications and Multimedia Act 1998</li>
          </ul>
        </Section>

        <Section title="No accounts, no guarantees">
          <p>KacipLuhh does not require an account. All rooms and messages are automatically deleted when the room expires. We make no guarantee of uptime, data preservation, or service availability. The service is provided as-is.</p>
        </Section>

        <Section title="Content responsibility">
          <p>You are solely responsible for the content you submit. KacipLuhh operators cannot read message content (end-to-end encrypted). Rooms may be closed without notice if reported for violating these terms.</p>
        </Section>

        <Section title="Abuse reporting">
          <p>Use the Report button within the room, or email <strong>snsyaqirah@gmail.com</strong>. Include the room link in your report.</p>
        </Section>

        <Section title="Governing law">
          <p>These terms are governed by the laws of Malaysia.</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-100 border-b border-zinc-800 pb-2">{title}</h2>
      <div className="text-sm text-zinc-400 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-zinc-200">
        {children}
      </div>
    </section>
  );
}
