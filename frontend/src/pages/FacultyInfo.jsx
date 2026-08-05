import ComingSoon from '../components/ComingSoon';

export default function FacultyInfo() {
  return (
    <ComingSoon
      icon="👨‍🏫"
      title="Faculty Info"
      tagline="Know your teachers"
      description="A searchable directory of every faculty member on campus — who they are, what they teach, where to find them and how to reach them."
      accent="from-violet-500/25 to-brand-500/15"
      features={[
        {
          icon: '🪪',
          title: 'Faculty Profiles',
          description:
            'Photo, designation, qualifications, research interests and the subjects each faculty member handles.',
        },
        {
          icon: '🏛',
          title: 'Department-wise Listing',
          description:
            'Browse faculty grouped by department and specialisation instead of scrolling one long list.',
        },
        {
          icon: '🚪',
          title: 'Cabin Locations',
          description:
            'Every cabin pinned on the campus map, with a one-tap handover into Map Buddy for directions.',
        },
        {
          icon: '📞',
          title: 'Contact Information',
          description:
            'Official email, extension number and consultation hours, so you never knock on a closed door.',
        },
      ]}
    />
  );
}
