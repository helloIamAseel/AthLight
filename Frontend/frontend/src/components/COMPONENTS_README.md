AthLight Component Library
All the reusable components for building the AthLight platform. Just import and use!
📁 File Structure
Put all these files in your src/components/ folder:
src/
├── components/
│   ├── FloatingCard.tsx
│   ├── FloatingCard.module.css
│   ├── Button.tsx
│   ├── Button.module.css
│   ├── Input.tsx
│   ├── Input.module.css
│   ├── Avatar.tsx
│   ├── Avatar.module.css
│   ├── StatsCard.tsx
│   ├── StatsCard.module.css
│   ├── SearchBar.tsx
│   ├── SearchBar.module.css
│   ├── Dropdown.tsx
│   ├── Dropdown.module.css
│   ├── VideoCard.tsx
│   ├── VideoCard.module.css
│   ├── Modal.tsx
│   ├── Modal.module.css
│   ├── TopNav.tsx
│   ├── TopNav.module.css
│   ├── BottomNav.tsx
│   ├── BottomNav.module.css
│   ├── NotificationBadge.tsx
│   ├── NotificationBadge.module.css
│   ├── UserHeader.tsx
│   ├── UserHeader.module.css
│   ├── FAB.tsx
│   └── FAB.module.css
🎨 Components
FloatingCard
White card with shadow and hover effect.
tsximport FloatingCard from './components/FloatingCard';

<FloatingCard>
  <h1>Your content here</h1>
</FloatingCard>
Button
Primary, secondary, text, and link variants.
tsximport Button from './components/Button';

<Button variant="primary">Follow</Button>
<Button variant="secondary">Edit Profile</Button>
<Button variant="text">Cancel</Button>
<Button variant="primary" large>Big Button</Button>
Input
Text input with error/valid states.
tsximport Input from './components/Input';
import { useState } from 'react';

const [email, setEmail] = useState('');

<Input 
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={false}
  valid={true}
/>
Avatar
Profile picture with green ring and optional camera button.
tsximport Avatar from './components/Avatar';

<Avatar 
  src="/path/to/image.jpg"
  size="large"
  showCamera={true}
  onCameraClick={() => console.log('Upload photo')}
/>

// Sizes: 'small', 'medium', 'large'
StatsCard
Green-bordered metric card.
tsximport StatsCard from './components/StatsCard';

<StatsCard label="Speed" value="32.5 km/h" />
<StatsCard label="Distance" value="11.2 km" />
SearchBar
Search input with icon.
tsximport SearchBar from './components/SearchBar';
import { useState } from 'react';

const [search, setSearch] = useState('');

<SearchBar 
  placeholder="Search athletes..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
Dropdown
Select dropdown with custom styling.
tsximport Dropdown from './components/Dropdown';
import { useState } from 'react';

const [metric, setMetric] = useState('speed');

<Dropdown 
  label="Metric Type"
  value={metric}
  onChange={(e) => setMetric(e.target.value)}
  options={[
    { value: 'speed', label: 'Average Speed' },
    { value: 'distance', label: 'Distance' }
  ]}
/>
VideoCard
Video thumbnail with play button and delete option.
tsximport VideoCard from './components/VideoCard';

<VideoCard 
  thumbnail="/path/to/thumbnail.jpg"
  title="Sprint Training Session"
  category="Training"
  views={1234}
  date="Dec 10, 2025"
  onPlay={() => console.log('Play video')}
  onDelete={() => console.log('Delete video')}
/>
Modal
Popup dialog with close button.
tsximport Modal from './components/Modal';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Upload Video"
>
  <p>Modal content here</p>
</Modal>
TopNav
Top navigation bar with search, notifications, and actions.
tsximport TopNav from './components/TopNav';
import { useState } from 'react';

const [search, setSearch] = useState('');

<TopNav 
  searchValue={search}
  onSearchChange={(e) => setSearch(e.target.value)}
  notificationCount={3}
  onNotificationClick={() => console.log('Show notifications')}
  onFilterClick={() => console.log('Open filters')}
  onLogoutClick={() => console.log('Logout')}
  onDarkModeClick={() => console.log('Toggle dark mode')}
  onAvatarClick={() => console.log('Go to profile')}
  avatarSrc="/path/to/avatar.jpg"
  showLogout={true}
  showDarkMode={true}
/>

// Optional: Hide logout or dark mode icons
<TopNav 
  {...props}
  showLogout={false}
  showDarkMode={false}
/>
BottomNav
Bottom navigation bar (Feed/Following).
tsximport BottomNav from './components/BottomNav';
import { useState } from 'react';

const [active, setActive] = useState('feed');

const navItems = [
  {
    id: 'feed',
    label: 'Feed',
    icon: <svg>...</svg>
  },
  {
    id: 'following',
    label: 'Following',
    icon: <svg>...</svg>
  }
];

<BottomNav 
  items={navItems}
  activeId={active}
  onItemClick={setActive}
/>
NotificationBadge
Green circle with notification count.
tsximport NotificationBadge from './components/NotificationBadge';

<NotificationBadge 
  count={3}
  onClick={() => console.log('Show notifications')}
/>
UserHeader
Profile pic + name + timestamp combo.
tsximport UserHeader from './components/UserHeader';
import Button from './components/Button';

<UserHeader 
  avatar="/path/to/avatar.jpg"
  name="Mohammed Al-Rashid"
  timestamp="2 hours ago"
  action={<Button variant="primary">Follow</Button>}
/>
FAB
Floating action button (that green + button).
tsximport FAB from './components/FAB';

<FAB onClick={() => console.log('Add new')} />
🎨 Colors
The components use these CSS variables (defined in index.css):
css--primary-color: #10b981 (green)
--gradient-start: #06b6d4 (cyan)
--gradient-end: #10b981 (green)
--text-dark: #000
--text-light: #666
--background: #f0f0f0
--border-color: #e5e7eb
Primary gradient: Cyan (#06b6d4) to Green (#10b981)

Used in buttons, avatars, and accent elements
Matches the AthLight brand colors

💡 Tips

Always use useState for inputs, search bars, dropdowns
Import components individually - keeps code clean
Check ComponentShowcase.tsx for full examples
All components have TypeScript types - your IDE will help you!
Use style prop for inline styles - Button, Input, and other components support style={{ ... }}
Fonts: Project uses Be Vietnam Pro (Latin) and IBM Plex Sans Arabic (Arabic)

🚀 Getting Started
See ComponentShowcase.tsx and AthleteFeedPage.tsx for complete working examples of all components together!