import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderForm from "@/components/order/OrderForm";
import HowItWorks from "@/components/order/HowItWorks";

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 font-body">
      <Navbar />

      {/* Hero Section */}
      <section
        className="px-5 pt-8 pb-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1A4B8C 0%, #0A2342 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-5 -right-5 w-[120px] h-[120px] rounded-full bg-white/5" />
        <div className="absolute bottom-2.5 -left-8 w-[90px] h-[90px] rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/[0.03]" />

        <h1 className="font-display text-[28px] font-bold text-white leading-tight mb-2 relative z-10">
          Fresh water,
          <br />
          delivered today.
        </h1>
        <p className="text-blue-200 text-sm relative z-10">
          20-litre jugs · Nairobi · From KES 300
        </p>
      </section>

      {/* Order Form */}
      <OrderForm />

      {/* How It Works */}
      <HowItWorks />

      {/* Footer */}
      <Footer />
    </div>
  );
}
