import ComingSoon from '../components/ComingSoon';

export default function Alumni() {
  return (
    <ComingSoon
      icon="🎓"
      title="Alumni"
      tagline="Stay connected"
      description="Meet the people who walked these corridors before you — where they went, what they built, and how they can help you get there too."
      accent="from-amber-500/25 to-rose-500/15"
      features={[
        {
          icon: '📖',
          title: 'Alumni Directory',
          description:
            'Search graduates by batch, branch, company or city and see where your seniors landed.',
        },
        {
          icon: '🌟',
          title: 'Success Stories',
          description:
            'Long-form interviews and journeys from alumni who took unusual paths after graduation.',
        },
        {
          icon: '🤝',
          title: 'Networking',
          description:
            'Request a mentor, ask for a referral, or join a batch group — all inside CampusBuddy.',
        },
        {
          icon: '🗓',
          title: 'Alumni Meets',
          description:
            'Reunion schedules, guest lectures and campus visits announced right on the dashboard.',
        },
      ]}
    />
  );
}
