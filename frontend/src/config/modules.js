/**
 * The module registry drives the navigation bar and the router.
 * Adding a future module means adding one entry here plus its page component —
 * nothing else in the shell needs to change.
 */
export const MODULES = [
  {
    key: 'map-buddy',
    path: '/map-buddy',
    label: 'Map Buddy',
    icon: '🗺',
    status: 'available',
    tagline: 'Campus navigation',
  },
  {
    key: 'faculty-info',
    path: '/faculty',
    label: 'Faculty Info',
    icon: '👨‍🏫',
    status: 'coming-soon',
    tagline: 'Profiles, cabins & contacts',
  },
  {
    key: 'alumni',
    path: '/alumni',
    label: 'Alumni',
    icon: '🎓',
    status: 'coming-soon',
    tagline: 'Directory & networking',
  },
  {
    key: 'ai-assistant',
    path: '/ai-assistant',
    label: 'AI Assistant',
    icon: '🤖',
    status: 'coming-soon',
    tagline: 'Ask anything about campus',
  },
];

export const DEFAULT_MODULE_PATH = '/map-buddy';
