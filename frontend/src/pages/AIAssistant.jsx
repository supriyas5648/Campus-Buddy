import ComingSoon from '../components/ComingSoon';

export default function AIAssistant() {
  return (
    <ComingSoon
      icon="🤖"
      title="AI Assistant"
      tagline="Ask campus anything"
      description="A conversational assistant that knows the campus inside out — timings, rules, directions, deadlines and everything students keep asking the office about."
      accent="from-accent-500/25 to-brand-500/20"
      features={[
        {
          icon: '❓',
          title: 'Campus FAQs',
          description:
            'Hostel rules, fee deadlines, library timings and holiday lists answered instantly.',
        },
        {
          icon: '🧭',
          title: 'Navigation Help',
          description:
            'Ask "how do I get to the Admin Building?" in plain language and get the route on the map.',
        },
        {
          icon: '🎪',
          title: 'Event Information',
          description:
            'Fests, workshops, sports meets and guest lectures — what is on, where and when.',
        },
        {
          icon: '📚',
          title: 'Academic Assistance',
          description:
            'Syllabus lookups, exam schedules and pointers to the right resources for each subject.',
        },
      ]}
    />
  );
}
