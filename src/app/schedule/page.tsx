"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect } from "react";
import { Calendar, Clock, ChevronRight, Droplets, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function getNextSevenDays(): Array<{ date: string; label: string; dayName: string }> {
  const days: Array<{ date: string; label: string; dayName: string }> = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split("T")[0],
      label: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[d.getDay()],
    });
  }
  return days;
}

const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
];

export default function SchedulePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items } = useCart();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const days = getNextSevenDays();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/schedule");
    }
  }, [user, authLoading, router]);

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;
    // Store schedule in sessionStorage for the checkout flow
    sessionStorage.setItem("mimaji_scheduled_delivery", JSON.stringify({
      date: selectedDate,
      time: selectedTime,
    }));
    if (items.length === 0) {
      router.push("/buy");
    } else {
      router.push("/delivery");
    }
  };

  if (!user) return null;

  const content = (
    <>
      <p className="text-text-secondary text-sm mb-6">
        Choose a date and time for your water delivery. We will make sure your order arrives on schedule.
      </p>

      {/* Date Selection */}
      <h3 className="font-bold text-sm text-text-primary mb-3 flex items-center gap-2">
        <Calendar size={16} className="text-primary" />
        Select Delivery Date
      </h3>
      <div className="grid grid-cols-4 gap-2 mb-6 md:grid-cols-7">
        {days.map((day) => (
          <button
            key={day.date}
            onClick={() => setSelectedDate(day.date)}
            className={`flex flex-col items-center py-3 px-2 rounded-xl text-center transition-colors ${
              selectedDate === day.date
                ? "bg-primary text-white"
                : "bg-surface shadow-card text-text-primary hover:border-primary border-2 border-transparent"
            }`}
          >
            <span className={`text-[10px] font-semibold uppercase ${
              selectedDate === day.date ? "text-white/80" : "text-text-secondary"
            }`}>{day.dayName}</span>
            <span className="text-sm font-bold mt-1">{day.label}</span>
          </button>
        ))}
      </div>

      {/* Time Selection */}
      <h3 className="font-bold text-sm text-text-primary mb-3 flex items-center gap-2">
        <Clock size={16} className="text-primary" />
        Select Delivery Time
      </h3>
      <div className="flex flex-col gap-2 mb-6">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedTime(slot)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              selectedTime === slot
                ? "bg-primary-light border-2 border-primary"
                : "bg-surface shadow-card border-2 border-transparent"
            }`}
          >
            <Clock size={16} className={selectedTime === slot ? "text-primary" : "text-text-secondary"} />
            <span className={`text-sm font-semibold ${
              selectedTime === slot ? "text-primary" : "text-text-primary"
            }`}>{slot}</span>
          </button>
        ))}
      </div>

      {/* Summary */}
      {selectedDate && selectedTime && (
        <div className="bg-[#E8F5E9] rounded-xl p-4 mb-6">
          <p className="text-sm font-bold text-text-primary mb-1">Scheduled Delivery</p>
          <p className="text-text-secondary text-xs">
            {days.find((d) => d.date === selectedDate)?.dayName}, {days.find((d) => d.date === selectedDate)?.label} at {selectedTime}
          </p>
        </div>
      )}

      {/* CTA */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleContinue}
        disabled={!selectedDate || !selectedTime}
      >
        {items.length === 0 ? (
          <span className="flex items-center justify-center gap-2">
            <ShoppingCart size={18} />
            Select Water & Continue
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Droplets size={18} />
            Continue to Delivery Address
          </span>
        )}
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Schedule Delivery" />
        <div className="max-w-md mx-auto px-4 pt-4">
          {content}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
              <Link href="/dashboard" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">
                {user.name}
              </Link>
            </nav>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Schedule Delivery</h1>
          {content}
        </div>
      </div>
    </div>
  );
}
