import { LegalPage } from "../_components/legal-page";

const privacySections = [
  {
    title: "Information we may collect",
    body: [
      "Daily Language Gym may later collect account information such as your name, email address, and authentication provider details when you sign in.",
      "The app may also collect practice activity, selected learner level, sentence attempts, accuracy, typing speed, mistakes, audio replay counts, progress history, and plan or access status."
    ]
  },
  {
    title: "Guest practice",
    body: [
      "The MVP may allow limited guest practice before account creation. Guest activity may be temporary and may not be saved unless a future version supports transferring guest progress after sign-in.",
      "Important long-term progress should be associated with an account rather than stored only on the device."
    ]
  },
  {
    title: "Google sign-in",
    body: [
      "A future MVP phase may use Google sign-in for authentication. If enabled, Google may provide basic profile information needed to create and manage your account.",
      "Authentication data should be handled through the selected authentication provider and should not require users to share a password directly with Daily Language Gym."
    ]
  },
  {
    title: "How we may use information",
    body: [
      "We may use account and practice information to provide the service, save progress, personalize practice, show results, enforce access limits, troubleshoot issues, and improve the product.",
      "Future versions may use practice data to identify weak words, repeated mistakes, listening difficulty, and improvement over time."
    ]
  },
  {
    title: "Analytics",
    body: [
      "The app may later use basic analytics to understand usage patterns, such as page visits, guest practice starts, workout completions, and feature engagement.",
      "Analytics should be used to improve the service and should avoid collecting sensitive typed content unless clearly needed for learning features."
    ]
  },
  {
    title: "Payments and subscriptions",
    body: [
      "Payments and subscriptions are planned for a later phase and are not active in the MVP.",
      "If subscriptions are added later, payment details should be handled by a payment provider rather than stored directly by Daily Language Gym."
    ]
  },
  {
    title: "Data security",
    body: [
      "The product should use reasonable technical safeguards for account and practice data, including environment-based secrets and database access controls.",
      "No online service can guarantee complete security, so users should avoid entering sensitive personal information into practice fields."
    ]
  },
  {
    title: "Contact and updates",
    body: [
      "This policy may be updated as the product evolves. Future versions should include a clear contact method before public launch."
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      intro="This Privacy Policy explains what information Daily Language Gym may collect and how it may be used as the MVP develops."
      sections={privacySections}
      title="Privacy Policy"
    />
  );
}
