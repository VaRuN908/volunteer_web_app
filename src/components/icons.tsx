import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function SvgIcon({
  className,
  children,
  viewBox = "0 0 24 24"
}: IconProps & { children: ReactNode; viewBox?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox={viewBox}
    >
      {children}
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5.5 10.5v9h13v-9" />
    </SvgIcon>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M5 6.5h14v9H9l-4 3v-12z" />
    </SvgIcon>
  );
}

export function ProfileIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19c1.6-3 4-4.5 6.5-4.5S16.9 16 18.5 19" />
    </SvgIcon>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="11" cy="11" r="5.25" />
      <path d="M16 16l3.5 3.5" />
    </SvgIcon>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    </SvgIcon>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M10 14l4-4" />
      <path d="M8 16l-1.6 1.6a3 3 0 104.2 4.2L12 20" />
      <path d="M16 8l1.6-1.6a3 3 0 10-4.2-4.2L12 4" />
    </SvgIcon>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <rect x="4.5" y="4.5" width="5" height="5" rx="1.2" />
      <rect x="14.5" y="4.5" width="5" height="5" rx="1.2" />
      <rect x="4.5" y="14.5" width="5" height="5" rx="1.2" />
      <rect x="14.5" y="14.5" width="5" height="5" rx="1.2" />
    </SvgIcon>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M8 17h8l-1-1.8v-4.2a4 4 0 10-8 0v4.2L8 17z" />
      <path d="M10.25 18.5a2 2 0 003.5 0" />
    </SvgIcon>
  );
}

export function BackIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M14.5 6.5L9 12l5.5 5.5" />
    </SvgIcon>
  );
}

export function MoreIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M5.5 12.5l4 4 9-9" />
    </SvgIcon>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 4l6 2.5v5.8c0 3.8-2.4 6.6-6 7.7-3.6-1.1-6-3.9-6-7.7V6.5L12 4z" />
      <path d="M9.4 12.2l1.6 1.6 3.7-3.7" />
    </SvgIcon>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M19 12a7 7 0 01-.1 1.2l2.1 1.6-2 3.5-2.5-1a7.5 7.5 0 01-2.1 1.3l-.4 2.7H10l-.4-2.7a7.5 7.5 0 01-2.1-1.3l-2.5 1-2-3.5 2.1-1.6A7 7 0 015 12c0-.4 0-.8.1-1.2L3 9.2l2-3.5 2.5 1a7.5 7.5 0 012.1-1.3L10 2.7h4l.4 2.7a7.5 7.5 0 012.1 1.3l2.5-1 2 3.5-2.1 1.6c.1.4.1.8.1 1.2z" />
    </SvgIcon>
  );
}

export function HelpIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.2a2.7 2.7 0 115 1.3c0 1.7-2 2.1-2.5 3.3" />
      <path d="M12 17h.01" />
    </SvgIcon>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M4 7h16v10H4z" />
      <path d="M4.5 7.5L12 13l7.5-5.5" />
    </SvgIcon>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M7.5 10.5h9v9h-9z" />
      <path d="M9 10.5V8.4a3 3 0 116 0v2.1" />
      <path d="M12 14v2.3" />
    </SvgIcon>
  );
}

export function PaperclipIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M9.5 12.5l5.6-5.6a3 3 0 114.2 4.2l-7.2 7.2a4.5 4.5 0 11-6.4-6.4l6.8-6.8" />
    </SvgIcon>
  );
}

export function SmileIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 14.5c.9 1 1.9 1.5 3 1.5s2.1-.5 3-1.5" />
      <path d="M9.2 10h.01" />
      <path d="M14.8 10h.01" />
    </SvgIcon>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M4 19l16-7L4 5l2.5 7L20 12" />
    </SvgIcon>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="9" cy="9" r="2.8" />
      <path d="M4.8 18c.9-2.3 2.5-3.6 4.2-3.6 1.7 0 3.3 1.3 4.2 3.6" />
      <circle cx="16.5" cy="8.5" r="2.2" />
      <path d="M14.8 14.5c1.4.2 2.6 1.1 3.4 2.7" />
    </SvgIcon>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </SvgIcon>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </SvgIcon>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </SvgIcon>
  );
}
