export interface SidebarItem {
  id: number;
  icon: string;
  iconActive: string;
  tooltipText: string;
  route: string;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 1,
    icon: 'assets/icons/icon-home.svg',
    iconActive: 'assets/icons/icon-home-active.svg',
    tooltipText: 'Home',
    route: '/home',
  },
  {
    id: 2,
    icon: 'assets/icons/icon-calendar.svg',
    iconActive: 'assets/icons/icon-calendar-active.svg',
    tooltipText: 'Settings',
    route: '/routine-detail',
  },
];
