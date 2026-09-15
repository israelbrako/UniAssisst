export interface CannedResponse {
  id: string;
  categoryId: string;
  title: string;
  content: string;
}

export const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: "cr-wifi-1",
    categoryId: "wifi-network",
    title: "Eduroam Certificate Re-enrollment",
    content: "Hi! To fix the recurring Eduroam handshake drop, please forget the 'eduroam' network in your device settings, open your browser to cat.eduroam.org, download our campus certificate profile, and re-authenticate with your full campus email.",
  },
  {
    id: "cr-wifi-2",
    categoryId: "wifi-network",
    title: "Dorm MAC Address Whitelist",
    content: "We have whitelisted your gaming console/device MAC address on the campus IoT network. Please restart your device; you should now see an active IP assignment on the 10.142.x subnet.",
  },
  {
    id: "cr-portal-1",
    categoryId: "portal-lms",
    title: "Canvas Cache & Incognito Diagnostic",
    content: "Hello! Canvas SSO redirect loops usually stem from expired Shibboleth session cookies. Please try loading Canvas in an Incognito/Private window. If that succeeds, clear your browser cookies for '*.campus.edu' and restart your browser.",
  },
  {
    id: "cr-portal-2",
    categoryId: "portal-lms",
    title: "Course Enrollment Sync Delay",
    content: "If you just registered for this class in the Registrar portal, please note that student rosters sync to Canvas every 3 hours (next sync at the top of the hour). Check back shortly and let us know if it hasn't populated by 4 PM.",
  },
  {
    id: "cr-hard-1",
    categoryId: "hardware-diagnostics",
    title: "Bring Laptop to Help Desk Desk (Union 204)",
    content: "Based on the thermal and fan behavior you described, we'd like to perform a physical hardware diagnostic. Please bring your laptop and power adapter to the Student Union Desk, Room 204. We can run battery & thermal diagnostics while you wait.",
  },
  {
    id: "cr-soft-1",
    categoryId: "software-os",
    title: "MATLAB Campus Concurrent License Fix",
    content: "To activate MATLAB using our campus site license: Open MATLAB > Help > Licensing > Activate Software. Choose 'Activate using Internet' and enter the university license number found on the IT Software Portal (License #40921820).",
  },
  {
    id: "cr-2fa-1",
    categoryId: "account-2fa",
    title: "Duo Mobile Bypass Code & Reconnect",
    content: "We have generated a single-use 12-hour Duo bypass code for you. Once you log in, navigate to 'My Settings & Devices' to register your new phone's authenticator app. Your bypass code has been sent to your backup phone via SMS.",
  },
  {
    id: "cr-print-1",
    categoryId: "printing-peripherals",
    title: "Pharos Print Balance Refresh & Queue Release",
    content: "We refreshed your Pharos print queue balance and cleared the stalled spool job. You can now tap your student ID badge at any library or science building printer to release your document.",
  },
];

export function getCannedResponsesByCategory(categoryId?: string): CannedResponse[] {
  if (!categoryId) return CANNED_RESPONSES;
  return CANNED_RESPONSES.filter((cr) => cr.categoryId === categoryId);
}
