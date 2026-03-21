"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect } from "react";
import { Calendar, Clock, ChevronRight, Droplets, ShoppingCart, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDayLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return DAY_NAMES[d.getDay()];
}

function getQuickDays(): Array<{ date: string; label: string; dayName: string }> {
  const days: Array<{ date: string; label: string; dayName: string }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split("T")[0],
      label: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
      dayName: formatDayLabel(d),
    });
  }
  return days;
}

function getCalendarDays(year: number, month: number): Array<{ date: string; day: number; inMonth: boolean }> {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<{ date: string; day: number; inMonth: boolean }> = [];

  // Padding for start of week
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: "", day: 0, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    days.push({
      date: dt.toISOString().split("T")[0],
      day: d,
      inMonth: true,
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
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const quickDays = getQuickDays();
  const calendarDays = getCalendarDays(calYear, calMonth);
  const todayStr = today.toISOString().split("T")[0];

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

  if (authLoading || !user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  );

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

      {/* Quick Date Buttons (next 7 days) */}
      <div className="grid grid-cols-4 gap-2 mb-3 md:grid-cols-7">
        {quickDays.map((day) => (
          <button
            key={day.date}
            onClick={() => { setSelectedDate(day.date); setShowFullCalendar(false); }}
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

      {/* Pick Another Date toggle */}
      <button
        onClick={() => setShowFullCalendar(!showFullCalendar)}
        className="text-primary text-xs font-semibold mb-4 underline"
      >
        {showFullCalendar ? "Hide calendar" : "Pick another date..."}
      </button>

      {/* Full Calendar */}
      {showFullCalendar && (
        <div className="bg-surface shadow-card rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
              else setCalMonth(calMonth - 1);
            }} className="p-1 rounded-lg hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <span className="font-bold text-sm text-text-primary">{FULL_MONTH_NAMES[calMonth]} {calYear}</span>
            <button onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
              else setCalMonth(calMonth + 1);
            }} className="p-1 rounded-lg hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_NAMES.map((dn) => (
              <span key={dn} className="text-[10px] font-semibold text-text-secondary py-1">{dn}</span>
            ))}
            {calendarDays.map((cd, i) => {
              if (!cd.inMonth) return <span key={`pad-${i}`} />;
              const isPast = cd.date < todayStr;
              const isSelected = cd.date === selectedDate;
              return (
                <button
                  key={cd.date}
                  disabled={isPast}
                  onClick={() => { setSelectedDate(cd.date); }}
                  className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : isPast
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-text-primary hover:bg-primary-light"
                  }`}
                >
                  {cd.day}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            {(() => {
              const quick = quickDays.find((d) => d.date === selectedDate);
              if (quick) return `${quick.dayName}, ${quick.label}`;
              const dt = new Date(selectedDate + "T00:00:00");
              return `${DAY_NAMES[dt.getDay()]}, ${dt.getDate()} ${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}`;
            })()} at {selectedTime}
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
    <div className="min-h-screen bg-background pb-16">
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
