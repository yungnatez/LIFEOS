import Nav from "@/components/shared/Nav";
import Footer from "@/components/shared/Footer";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export default function AnalyticsPage() {
  return (
    <>
      <Nav />
      <main className="max-w-[1440px] mx-auto p-6">
        <AnalyticsClient />
      </main>
      <Footer />
    </>
  );
}
