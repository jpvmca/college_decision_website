import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: 'Privacy Policy',
  description: 'Read the CollegeDecision.in Privacy Policy covering website usage, student registration and enquiry forms, contact messages and technical data.',
  alternates: { canonical: '/privacy-policy' }
};

export default function PrivacyPolicyPage() {
  return <main className="section"><div className="wrap prose">
    <p className="eyebrow">LEGAL INFORMATION</p>
    <h1>Privacy Policy</h1>
    <p className="muted">Last updated: 30 October 2026</p>
    <p>This Privacy Policy explains how CollegeDecision.in handles information when you browse our college guides, use search, register for counselling or contact us. We aim to collect only what is needed to operate, protect and improve the website.</p>
    <h2>Information you provide</h2>
    <p>If you email us, we receive the information you choose to include, such as your name, email address, message, page URL and supporting source. Please do not send passwords, payment information, government identity documents or sensitive student records.</p>
    <h2>Student registration and enquiry form</h2>
    <p>Our website shows a short registration form so students can get admission guidance. If you submit it, we collect:</p>
    <ul><li>Your name, mobile number and email address.</li><li>The course you are interested in.</li><li>Your approximate location: country, state and city. In India you can choose or edit your state and city; outside India we work them out from your IP address.</li><li>Your IP address, the page you submitted the form on and its page type, and any campaign (UTM) tags in the link that brought you to the site.</li><li>If you submit the form on a college page, the college and course you were viewing, recorded as your interest in that college.</li></ul>
    <p>We use these details to respond to your enquiry, provide admission counselling, share information about colleges and courses that match your interest, and understand which pages help students. If you submit the form again with the same mobile number or email address, we update your existing record instead of creating a new one.</p>
    <h2>Approximate location from your IP address</h2>
    <p>To pre-fill your location, our server sends your IP address to an IP geolocation provider (ipinfo.io), which returns an approximate country, state and city. We do not use GPS or ask for your device location.</p>
    <h2>Local storage on your device</h2>
    <p>Your browser stores a small record in local storage containing your course interest, your approximate country, state and city, and whether you have submitted or closed the form. This avoids looking up your location again, avoids showing the form repeatedly and lets college pages show your course of interest first. Campaign (UTM) tags are kept in session storage until you close the tab. You can remove this data at any time by clearing your browser&apos;s site data for CollegeDecision.in.</p>
    <h2>Information collected automatically</h2>
    <p>Like most websites, our hosting and security systems may process technical information such as IP address, browser type, device information, referring page and request time. This helps us prevent abuse, diagnose errors and understand general site performance.</p>
    <h2>How we use information</h2>
    <ul><li>To respond to enquiries and provide admission counselling you request through our forms.</li><li>To respond to questions and data-correction requests.</li><li>To investigate security, reliability and performance problems.</li><li>To improve article structure, search and the student experience.</li><li>To comply with applicable legal obligations.</li></ul>
    <h2>Cookies and analytics</h2>
    <p>We use essential technologies needed for security, preferences and basic operation of the site. When ads are shown, Google and its advertising partners may also set cookies, as explained in the Advertising section below. If we add analytics or other optional cookies, we will update this policy with their purpose and how you can control them.</p>
    <h2>Advertising</h2>
    <p>CollegeDecision.in shows ads to help keep our guides free for students. These ads are served by Google AdSense and its partners. We place each ad ourselves in fixed spots on the page; we do not use Google Auto ads, and every ad is labelled &ldquo;Advertisement&rdquo; so you can tell it apart from our own content.</p>
    <ul><li>Google and its vendors use cookies, including the DoubleClick cookie, to show ads based on your visits to this website and other websites on the internet.</li><li>Depending on our settings and your consent choices, we may show non-personalised ads, which are based on general context such as the page you are reading rather than your browsing history.</li><li>You can turn off personalised advertising from Google at <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>, and opt out of personalised ads from many other vendors at <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</li><li>To learn how Google uses information from sites that use its services, see <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses information from sites or apps that use our services</a>.</li></ul>
    <p>We do not sell your personal information to advertisers, and we do not share the details you enter in our registration or contact forms with ad providers. Questions about ads on this site can be sent to <a href="mailto:privacy@collegedecision.in">privacy@collegedecision.in</a>.</p>
    <h2>Sharing and retention</h2>
    <p>We do not sell personal information. Information may be processed by service providers that host, secure or operate the website, subject to appropriate safeguards. We retain correspondence and registration details only as long as reasonably necessary for the enquiry, counselling, records, security or legal obligations.</p>
    <h2>Your choices</h2>
    <p>You may ask what personal information we hold about you, including details submitted through the registration form, and request correction or deletion. You may also ask us to stop contacting you. Contact <a href="mailto:privacy@collegedecision.in">privacy@collegedecision.in</a> with enough context for us to locate the request.</p>
    <h2>Updates</h2>
    <p>We may revise this policy when the website or applicable requirements change. The “Last updated” date identifies the latest version.</p>
  </div></main>;
}
