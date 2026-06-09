import { LegalPage } from "../_components/legal-page";

const termsSections = [
  {
    title: "Use of the service",
    body: [
      "Daily Language Gym is intended to help users practice English through short listening and typing workouts. The first launch focus is Arabic speakers learning English.",
      "You agree to use the service responsibly and not attempt to misuse, disrupt, reverse engineer, or interfere with the app."
    ]
  },
  {
    title: "Accounts and sign-in",
    body: [
      "A future MVP phase may support Google sign-in. You are responsible for maintaining access to the Google account or authentication method you use.",
      "Some features may require an account so progress, settings, results, and access limits can be saved."
    ]
  },
  {
    title: "Guest mode",
    body: [
      "Guest Mode may allow limited first practice before sign-in. Guest sessions are provided for trial use and may not save long-term progress.",
      "The app may ask users to sign in after guest practice to save progress and continue using account-based features."
    ]
  },
  {
    title: "Learning content and results",
    body: [
      "The app may show English sentences, Arabic translations, audio references, typing feedback, accuracy, mistakes, and progress summaries.",
      "Practice results are informational and educational. The app does not guarantee a specific learning outcome, test score, job result, or level of fluency."
    ]
  },
  {
    title: "Free and premium access",
    body: [
      "The MVP may include a freemium-ready structure with limited free daily access.",
      "Paid subscriptions and premium access are planned for a later phase but are not active in the MVP. Any future paid terms should be added and reviewed before launch."
    ]
  },
  {
    title: "User content and practice input",
    body: [
      "Users should only enter practice responses related to the exercises. Do not enter sensitive personal, financial, medical, or confidential information into practice fields.",
      "Future versions may process typed answers, mistakes, and replay counts to provide feedback and improve practice recommendations."
    ]
  },
  {
    title: "Availability and changes",
    body: [
      "The service may change as the MVP develops. Features, access limits, practice content, and page structure may be updated over time.",
      "The service may occasionally be unavailable due to maintenance, errors, hosting issues, or product changes."
    ]
  },
  {
    title: "Review before launch",
    body: [
      "These Terms are a simple MVP draft and should be reviewed by a qualified legal professional before the product is launched publicly."
    ]
  }
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      intro="These Terms describe the basic rules for using Daily Language Gym as the MVP develops."
      sections={termsSections}
      title="Terms of Service"
    />
  );
}
