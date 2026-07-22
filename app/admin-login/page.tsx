import SmartHomePortal from "@/components/smart/SmartHomePortal";

export const metadata = {
  title: "SMART Admin Portal",
  description: "SMART – AI-Powered Industry Readiness Intelligence Platform for Full Stack Engineers",
};

export default function AdminLoginPage() {
  return <SmartHomePortal initialTabMode="admin" />;
}
