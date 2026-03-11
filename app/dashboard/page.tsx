import Nav from "@/components/shared/Nav";
import Footer from "@/components/shared/Footer";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <main>
        <DashboardClient />
      </main>
      <Footer />
    </>
  );
}
