import { useLang } from '../context/LangContext.jsx';

export function PrivacyPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <a href="/" className="text-sm text-emerald-500 hover:underline">← KacipLuhh</a>
          <h1 className="text-2xl font-bold text-zinc-100 mt-4">Privacy Policy</h1>
          <p className="text-sm text-zinc-500 mt-1">Kemaskini: 30 May 2026</p>
        </div>

        <Section title="What we collect">
          <p>KacipLuhh collects as little as possible:</p>
          <ul>
            <li><strong>Nicknames & room names</strong> — stored temporarily until the room expires (max 48 hours).</li>
            <li><strong>Encrypted messages</strong> — encrypted in your browser with AES-256-GCM before reaching our servers. We store only ciphertext. We cannot read your messages.</li>
            <li><strong>Session tokens</strong> — random identifiers for nickname persistence. Stored in your browser's localStorage and on our server, both expiring within 48 hours.</li>
            <li><strong>Timestamps</strong> — when rooms are created and when messages are sent.</li>
            <li><strong>IP addresses</strong> — not logged by our application. Our hosting infrastructure (Render.com, Vercel) may log IPs as part of standard operations.</li>
          </ul>
          <p>We do <strong>not</strong> collect: email addresses, phone numbers, IC numbers, payment info, or real names.</p>
        </Section>

        <Section title="How data is stored & deleted">
          <p>All room data — messages, nicknames, tokens — auto-deletes when the room expires (6–48 hours). No manual backups of room content are taken. Your encryption key stays in your browser's localStorage only; it never reaches our servers.</p>
        </Section>

        <Section title="Third-party services">
          <p>Data may be processed outside Malaysia by:</p>
          <ul>
            <li><strong>Render.com</strong> — backend server hosting</li>
            <li><strong>Vercel</strong> — frontend hosting</li>
            <li><strong>Upstash / Redis Cloud</strong> (if applicable) — encrypted room data storage</li>
          </ul>
          <p>We do not use analytics, advertising networks, or AI/LLM APIs.</p>
        </Section>

        <Section title="Your rights (PDPA 2010)">
          <p>You have the right to access and correct your personal data. Since no accounts are created and all data auto-deletes, there is typically nothing to access. To delete data before expiry, the room owner can close the room manually.</p>
          <p>Privacy requests: <strong>snsyaqirah@gmail.com</strong></p>
        </Section>

        <Section title="Zero-knowledge architecture">
          <p>KacipLuhh is designed so we cannot read message content. The encryption key is embedded in your share link and stored only in your browser. Even if our servers were compromised, an attacker would only obtain ciphertext they cannot decrypt.</p>
        </Section>

        <Section title="Contact">
          <p>Privacy or abuse concerns: <strong>snsyaqirah@gmail.com</strong></p>
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
