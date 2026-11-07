import type { ReactNode, SVGProps } from "react";
import type { IntegrationId } from "@/lib/integrations";

/*
 * The integration icons, drawn for Linnet (linnet-design section 9): a
 * 24 × 24 grid, 1.5 px stroke, round caps and joins, no fill, currentColor.
 * Plain geometry for each category, never a brand mark. TypeScript makes
 * this map cover every id in src/lib/integrations.ts.
 */

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

/** A bank front: pediment, four columns, a base. */
function BankFeedsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.25 9.25 12 4l8.75 5.25z" />
      <path d="M6 12v5.5M10 12v5.5M14 12v5.5M18 12v5.5" />
      <path d="M3.25 20.25h17.5" />
    </Icon>
  );
}

/** A card with its stripe and a number. */
function CardPaymentsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="2" />
      <path d="M2.75 9.75h18.5M6.5 14.75h4" />
    </Icon>
  );
}

/** A transfer arriving in an account that carries its reference. */
function BankTransferIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.75 12h8.5M8.5 9.25 11.25 12 8.5 14.75" />
      <rect x="13.75" y="5.75" width="7.5" height="12.5" rx="1.5" />
      <path d="M16.5 9.75h2M16.5 12.5h2M16.5 15.25h2" />
    </Icon>
  );
}

/** A file holding a two-column table. */
function AccountingExportIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.75 2.75h8.5l4 4v14.5H5.75z" />
      <path d="M14 2.75V7h4.25" />
      <path d="M8.75 11.5h2.25M13 11.5h2.25M8.75 14.75h2.25M13 14.75h2.25M8.75 18h2.25M13 18h2.25" />
    </Icon>
  );
}

/** A calendar page with its rings and days. */
function CalendarsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.75" y="5.25" width="16.5" height="15" rx="2" />
      <path d="M3.75 9.75h16.5M8 3v4M16 3v4" />
      <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01" strokeWidth="2" />
    </Icon>
  );
}

/** An envelope. */
function EmailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="2" />
      <path d="m3.5 7 8.5 6.25L20.5 7" />
    </Icon>
  );
}

/** A clock beside a short list of logged entries. */
function TimeTrackingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="12" r="6.25" />
      <path d="M9 8.75V12l2.25 1.5" />
      <path d="M18 8h3.25M18 12h3.25M18 16h3.25" />
    </Icon>
  );
}

/** Angle brackets around a slash: code. */
function ApiIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m7.5 7-5 5 5 5M16.5 7l5 5-5 5" />
      <path d="m13.5 5-3 14" />
    </Icon>
  );
}

export const INTEGRATION_ICONS: Record<IntegrationId, (props: IconProps) => ReactNode> = {
  "bank-feeds": BankFeedsIcon,
  "card-payments": CardPaymentsIcon,
  "bank-transfer": BankTransferIcon,
  "accounting-export": AccountingExportIcon,
  calendars: CalendarsIcon,
  email: EmailIcon,
  "time-tracking": TimeTrackingIcon,
  api: ApiIcon,
};
