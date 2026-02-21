const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-100 py-8 overflow-y-auto h-full">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-semibold mb-4">Tunele Privacy Policy</h1>
        <p className="text-gray-600 mb-8">
          Effective as of <span className="underline">5 Oct 2023</span>
        </p>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p>Name, Email address</p>

          <h2 className="text-xl font-semibold my-4">2. How We Use Your Information</h2>
          <p>
            We use your information solely for the purpose of creating and maintaining your user
            account on Tunele. Your data is never sold or shared with third parties for marketing
            purposes.
          </p>

          <h2 className="text-xl font-semibold my-4">3. Data Security</h2>
          <p>
            We employ industry-standard security measures to protect your data from unauthorized
            access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-xl font-semibold my-4">4. Cookies and Analytics</h2>
          <p>
            Tunele may use cookies and analytics tools to improve our services and enhance your
            experience. These tools collect non-personal information, such as website usage
            patterns.
          </p>

          <h2 className="text-xl font-semibold my-4">5. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for their
            privacy practices or content. Please review the privacy policies of those websites
            separately.
          </p>

          <h2 className="text-xl font-semibold my-4">6. Your Choices</h2>
          <p>
            You have the right to:
            <ul className="list-disc pl-4">
              <li>Access and update your personal information.</li>
              <li>Request the deletion of your account and data.</li>
            </ul>
          </p>

          <h2 className="text-xl font-semibold my-4">7. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding your privacy or this policy, please
            contact us at{" "}
            <a href="mailto:support@tunele.app" className="text-blue-500">
              support@tunele.app
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold my-4">8. Changes to this Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Please check this page for the
            latest information.
          </p>

          <p className="text-sm text-gray-600 mt-8">
            By using Tunele, you agree to the terms of this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
