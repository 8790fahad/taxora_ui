import { Link } from 'react-router-dom';

type LegalPageProps = {
  type: 'terms' | 'privacy';
};

const providerName = 'NEXIFOUR LTD';
const effectiveDate = '7 June 2026';
const contactEmail = 'nexifour@gmail.com';
const websiteUrl = 'http://taxora.com.ng/';
const location = 'Nigeria';

function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
        <div className="mb-8 border-b border-slate-200 pb-6">
          <Link to="/" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Taxora
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <p className="mt-3 text-sm text-slate-600">
            <strong>Effective date:</strong> {effectiveDate}
            <br />
            <strong>Last updated:</strong> {effectiveDate}
          </p>
        </div>
        <div className="space-y-5 text-sm leading-6 text-slate-700 [&_a]:text-primary-600 [&_a]:font-medium [&_h2]:pt-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </article>
    </main>
  );
}

function ContactBlock() {
  return (
    <>
      <p>
        <strong>{providerName}</strong>
        <br />
        Email: <strong>{contactEmail}</strong>
        <br />
        Website: <strong>{websiteUrl}</strong>
        <br />
        Location: <strong>{location}</strong>
      </p>
    </>
  );
}

function TermsContent() {
  return (
    <PageShell
      title="Taxora End-User License Agreement (EULA)"
      subtitle="Terms governing access to and use of the Taxora e-invoicing compliance platform."
    >
      <p>
        This End-User License Agreement is a binding agreement between you and the business you
        represent and <strong>{providerName}</strong> ("Taxora", "we", "us", or "our"). By creating
        an account, accessing, or using Taxora, you agree to be bound by this Agreement.
      </p>
      <p>
        Taxora is an independent e-invoicing compliance platform that connects accounting and ERP
        systems such as Intuit QuickBooks, Zoho Books, Odoo, and TallyPrime to the Nigeria Revenue
        Service (NRS)/Federal Inland Revenue Service (FIRS) for invoice clearance. Taxora is not
        affiliated with, endorsed by, or sponsored by Intuit, Zoho, Odoo, Tally, or any tax
        authority.
      </p>

      <h2>1. License Grant</h2>
      <p>
        Subject to your compliance with this Agreement, we grant you a limited, non-exclusive,
        non-transferable, non-sublicensable, revocable license to access and use Taxora for your
        internal business purposes of preparing and submitting invoices for NRS/FIRS clearance.
      </p>

      <h2>2. Accounts and Eligibility</h2>
      <p>
        You must be at least 18 years old and authorized to act on behalf of your business. You are
        responsible for maintaining the confidentiality of your credentials and for all activity
        under your account.
      </p>

      <h2>3. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for unlawful, fraudulent, or misleading purposes;</li>
        <li>Submit false or inaccurate tax or invoice information;</li>
        <li>Reverse engineer, decompile, or attempt to extract source code;</li>
        <li>Resell, sublicense, or provide the Service to third parties without permission;</li>
        <li>Interfere with the integrity, security, or performance of the Service.</li>
      </ul>

      <h2>4. Connected Systems and Third-Party Services</h2>
      <p>
        When you connect an ERP or accounting system, you authorize Taxora to access and process
        data from that system to provide the Service. Third-party services, including Intuit
        QuickBooks, Zoho, Odoo, Tally, Remita, and NRS/FIRS, are governed by their own terms and
        policies.
      </p>

      <h2>5. Fees, Wallet, and Billing</h2>
      <p>
        Taxora operates on a prepaid wallet model. You fund your wallet through Remita, and Taxora
        charges <strong>₦10 per invoice processed</strong>, or the rate shown in the Service, from
        your wallet balance. Payment details are processed by Remita; Taxora does not store full card
        or bank details.
      </p>

      <h2>6. Customer Responsibilities</h2>
      <p>
        You are responsible for the accuracy, completeness, and legality of invoice data and tax
        information you submit. Taxora facilitates invoice submission but does not provide tax,
        legal, or accounting advice.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Service and related software, content, and trademarks are owned by Taxora or its
        licensors. You retain ownership of your invoice and business data.
      </p>

      <h2>8. Privacy</h2>
      <p>
        Our collection and use of personal data is described in our{' '}
        <Link to="/privacy">Privacy Policy</Link>, which is incorporated into this Agreement.
      </p>

      <h2>9. Disclaimers and Limitation of Liability</h2>
      <p>
        The Service is provided "as is" and "as available" without warranties of any kind. We do not
        warrant that invoices will be accepted or cleared by NRS/FIRS. To the maximum extent
        permitted by law, Taxora will not be liable for indirect, incidental, special, consequential,
        or punitive damages.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        This Agreement is governed by the laws of the Federal Republic of Nigeria, and disputes are
        subject to the courts of Nigeria.
      </p>

      <h2>11. Contact</h2>
      <ContactBlock />
    </PageShell>
  );
}

function PrivacyContent() {
  return (
    <PageShell
      title="Taxora Privacy Policy"
      subtitle="How Taxora collects, uses, shares, and protects data."
    >
      <p>
        This Privacy Policy explains how <strong>{providerName}</strong> ("Taxora", "we", "us", or
        "our") collects, uses, shares, and protects information when you use the Taxora e-invoicing
        compliance platform.
      </p>
      <p>
        Taxora helps businesses in Nigeria submit invoices to NRS/FIRS for clearance by connecting
        to accounting and ERP systems such as Intuit QuickBooks, Zoho Books, Odoo, and TallyPrime.
        We handle data in accordance with the Nigeria Data Protection Act, 2023 and the NDPR.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Account details such as name, email address, phone number, and hashed password;</li>
        <li>Business and tax profile details, including company name, TIN, address, and NRS/FIRS identifiers;</li>
        <li>Invoice, customer, supplier, product, service, and tax data from connected ERP systems;</li>
        <li>Wallet funding amounts and payment references processed through Remita;</li>
        <li>Technical logs such as IP address, device/browser information, timestamps, and audit events.</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>
        We use information to provide the Service, connect to ERP systems, synchronize invoice data,
        transform invoices into the NRS/FIRS format, submit invoices for clearance, process wallet
        billing, maintain audit logs, prevent fraud, communicate with users, and improve the
        platform.
      </p>

      <h2>3. QuickBooks and Intuit Data</h2>
      <p>
        When you connect QuickBooks, Taxora accesses QuickBooks data through Intuit APIs only to
        provide the e-invoicing functionality you request. We do not sell QuickBooks data, do not
        use it for advertising, and do not transfer it except as required to deliver the Service,
        such as submitting invoice data to NRS/FIRS. You may disconnect QuickBooks at any time.
      </p>

      <h2>4. How We Share Information</h2>
      <p>We share information only as necessary with:</p>
      <ul>
        <li>NRS/FIRS for invoice clearance;</li>
        <li>Remita for wallet funding and payment verification;</li>
        <li>Connected ERP providers where needed to authenticate and synchronize data;</li>
        <li>Infrastructure and security service providers under confidentiality obligations;</li>
        <li>Authorities where required by law.</li>
      </ul>
      <p>
        <strong>We do not sell personal data and do not use it for advertising.</strong>
      </p>

      <h2>5. Data Retention and Security</h2>
      <p>
        We retain data while your account is active and as required for tax, accounting, legal, and
        audit obligations. We protect data using measures such as TLS encryption in transit,
        encryption at rest for sensitive tokens and secrets, access controls, and audit logging.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Subject to applicable law, you may request access, correction, deletion, restriction,
        objection, portability, or withdrawal of consent. You may also lodge a complaint with the
        Nigeria Data Protection Commission (NDPC).
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use strictly necessary cookies and local storage to authenticate users and maintain
        sessions. We do not use third-party advertising cookies.
      </p>

      <h2>8. Contact</h2>
      <ContactBlock />
    </PageShell>
  );
}

export default function LegalPage({ type }: LegalPageProps) {
  return type === 'terms' ? <TermsContent /> : <PrivacyContent />;
}
