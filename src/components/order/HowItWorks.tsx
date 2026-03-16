const steps = [
  { n: "1", icon: "📋", title: "Order", sub: "Pick quantity & address" },
  { n: "2", icon: "📱", title: "Pay", sub: "M-Pesa STK Push" },
  { n: "3", icon: "🚐", title: "Receive", sub: "Delivered to your door" },
];

export default function HowItWorks() {
  return (
    <section className="px-4 py-7">
      <h2 className="text-center font-display text-lg text-blue-900 font-bold mb-5">
        How it works
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`text-center bg-white rounded-xl p-3.5 border border-blue-200 animate-fade-in stagger-${i + 1}`}
            style={{ opacity: 0 }}
          >
            <div className="font-display text-[28px] text-blue-200 font-black">
              {s.n}
            </div>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="font-bold text-xs text-blue-900">{s.title}</div>
            <div className="text-[10px] text-text-light mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
