// Example: How to use the icons

import { 
  HomeIcon, 
  FollowingIcon, 
  ProfileIcon,
  AddIcon,
  navItems,
  navItemsWithProfile
} from './constants/icons';
import BottomNav from './components/BottomNav';
import { useState } from 'react';

function ExampleUsage() {
  const [activeNav, setActiveNav] = useState('feed');

  return (
    <div>
      {/* Option 1: Use pre-configured navItems */}
      <BottomNav 
        items={navItems}
        activeId={activeNav}
        onItemClick={setActiveNav}
      />

      {/* Option 2: Use individual icons anywhere */}
      <button>
        <HomeIcon />
        Go Home
      </button>

      <button>
        <AddIcon />
        Add New
      </button>

      {/* Option 3: Create custom nav items */}
      <BottomNav 
        items={[
          { id: 'home', label: 'Home', icon: <HomeIcon /> },
          { id: 'profile', label: 'Profile', icon: <ProfileIcon /> }
        ]}
        activeId={activeNav}
        onItemClick={setActiveNav}
      />

      {/* Option 4: Use navItemsWithProfile for 3-tab navigation */}
      <BottomNav 
        items={navItemsWithProfile}
        activeId={activeNav}
        onItemClick={setActiveNav}
      />
    </div>
  );
}

export default ExampleUsage;
