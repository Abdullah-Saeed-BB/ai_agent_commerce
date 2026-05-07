import React from "react";

export const metadata = {
  title: "Privacy Policy | Silver Blade Barbershop",
  description: "Privacy Policy for Silver Blade Barbershop application.",
};

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-500">Last Updated: May 7, 2026</p>
        </header>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
          <p>
            Silver Blade Barbershop (“we,” “our,” or “us”) operates the Silver
            Blade Barbershop application. We are committed to protecting your
            privacy and ensuring that your personal data is handled in a safe
            and responsible manner. This Privacy Policy outlines how we collect,
            use, and protect your information when you use our services through
            the Meta platform.
          </p>

          <Section title="1. Information We Collect">
            <p className="mb-2">
              We collect information to provide better services to our clients.
              The types of information we collect include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Information You Provide:</strong> When you use our app
                to book an appointment or contact us, you may provide us with
                your name, email address, phone number, and appointment
                preferences.
              </li>
              <li>
                <strong>Data from Meta (Facebook/Instagram):</strong> If you
                access our services via Meta platforms, we may receive basic
                profile information permitted by your privacy settings, such as
                your name and profile identifier, to personalize your
                experience.
              </li>
              <li>
                <strong>Automatic Collection:</strong> We may collect certain
                information automatically, such as your device type, browser
                type, and how you interact with our app (usage data) to improve
                our technical performance.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p className="mb-2">
              We process your information for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Service Delivery:</strong> To schedule, manage, and
                confirm your barbering appointments.
              </li>
              <li>
                <strong>Communication:</strong> To send you booking
                confirmations, reminders, or updates regarding your
                appointments.
              </li>
              <li>
                <strong>Improvement:</strong> To analyze how our app is used so
                we can improve our user interface and customer service.
              </li>
              <li>
                <strong>Marketing:</strong> With your consent, we may send you
                promotional offers or news about Silver Blade Barbershop. You
                can opt-out of these at any time.
              </li>
            </ul>
          </Section>

          <Section title="3. Data Sharing and Disclosure">
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We only share data with third-party service providers
              (such as booking software) who are necessary to complete your
              transactions, and these providers are obligated to keep your
              information confidential.
            </p>
          </Section>

          <Section title="4. Data Retention and Deletion">
            <p>
              We retain your personal data only as long as necessary to provide
              you with our services.
            </p>
            <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">
              How to Request Data Deletion:
            </h3>
            <p className="mb-2">
              Users have the right to request the deletion of their data at any
              time. If you wish to have your personal information removed from
              our records, please contact us using one of the following methods:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Email:</strong> contact@silverblade.com
              </li>
            </ul>
            <p className="mt-4">
              Once a request is received, we will delete your personal data from
              our systems within 30 days, unless we are required to retain it
              for legal or tax purposes.
            </p>
          </Section>

          <Section title="5. Meta Platform Compliance">
            <p>
              In accordance with Meta’s Platform Terms, this policy is publicly
              available and easily accessible. We allow Meta’s crawlers to
              access this URL to ensure compliance with privacy standards.
            </p>
          </Section>

          <Section title="6. Security">
            <p>
              We implement a variety of security measures to maintain the safety
              of your personal information. However, no method of transmission
              over the internet is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update our Privacy Policy from time to time. Any changes
              will be posted on this page with an updated &quot;Last
              Updated&quot; date.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>
              If you have any questions regarding this Privacy Policy, you may
              contact us at:
            </p>
            <p className="mt-2 font-medium text-gray-800">
              Silver Blade Barbershop
              <br />
              Email: contact@silverblade.com
            </p>
          </Section>
        </div>

        <footer className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Silver Blade Barbershop. All rights
          reserved.
        </footer>
      </div>
    </div>
  );
};

const Section = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <section className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3 ml-2">
        {title}
      </h2>
      {children}
    </section>
  );
};

export default PrivacyPolicyPage;
