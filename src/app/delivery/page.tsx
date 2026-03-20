"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Home, Briefcase, Check, Trash2, Zap, Calendar, Clock } from "lucide-react";

import { logo1 } from "@/assets/images";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import AddressForm, { AddressDisplay } from "@/components/AddressForm";
import { useLocation, SavedLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";

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

export default function DeliveryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { savedLocations, selectedLocation, selectLocation, addSavedLocation, removeSavedLocation } = useLocation();

  const [showAddNew, setShowAddNew] = useState(false);
  const [saveNew, setSaveNew] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(selectedLocation?.id || null);

  // Delivery timing: "now" or "schedule"
  const [deliveryTiming, setDeliveryTiming] = useState<"now" | "schedule">("now");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const scheduleDays = getNextSevenDays();

  const handleSelectLocation = (loc: SavedLocation) => {
    setSelectedId(loc.id);
    selectLocation(loc);
    setShowAddNew(false);
  };

  const handleNewAddress = (loc: SavedLocation) => {
    if (saveNew) {
      addSavedLocation(loc);
    }
    selectLocation(loc);
    setSelectedId(loc.id);
    setShowAddNew(false);
  };

  const handleContinue = () => {
    if (selectedId || selectedLocation) {
      // Save or clear scheduling data
      if (deliveryTiming === "schedule" && selectedDate && selectedTime) {
        sessionStorage.setItem("mimaji_scheduled_delivery", JSON.stringify({
          date: selectedDate,
          time: selectedTime,
        }));
      } else {
        sessionStorage.removeItem("mimaji_scheduled_delivery");
      }
      router.push("/confirm");
    }
  };

  const canContinue = (selectedId || selectedLocation) && (deliveryTiming === "now" || (selectedDate && selectedTime));

  if (!user) {
    router.push("/login?redirect=/delivery");
    return null;
  }

  const content = (
    <>
      {/* Saved Locations */}
      {savedLocations.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold text-sm text-text-primary mb-3">Saved Locations</h2>
          {savedLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleSelectLocation(loc)}
              className={`w-full flex items-center gap-3 rounded-xl p-4 mb-2 transition-all text-left ${
                selectedId === loc.id
                  ? "bg-primary-light border-2 border-primary"
                  : "bg-surface border-2 border-transparent shadow-card"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedId === loc.id ? "bg-primary" : "bg-gray-100"
              }`}>
                {loc.type === "home" ? (
                  <Home size={20} className={selectedId === loc.id ? "text-white" : "text-text-secondary"} />
                ) : (
                  <Briefcase size={20} className={selectedId === loc.id ? "text-white" : "text-text-secondary"} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <AddressDisplay location={loc} />
              </div>
              {selectedId === loc.id && (
                <Check size={20} className="text-primary flex-shrink-0" />
              )}
              {selectedId !== loc.id && !["loc1", "loc2"].includes(loc.id) && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeSavedLocation(loc.id); }}
                  className="p-1"
                >
                  <Trash2 size={16} className="text-text-secondary" />
                </button>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Add New Location Button */}
      {!showAddNew && (
        <button
          onClick={() => setShowAddNew(true)}
          className="w-full flex items-center gap-3 rounded-xl p-4 bg-surface shadow-card border-2 border-dashed border-gray-200 hover:border-primary transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <Plus size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm text-primary">Add New Location</p>
            <p className="text-text-secondary text-xs">Enter a new delivery address</p>
          </div>
        </button>
      )}

      {/* Add New Location Form */}
      {showAddNew && (
        <div className="mt-2">
          <AddressForm
            onSubmit={handleNewAddress}
            onCancel={() => setShowAddNew(false)}
            showSaveCheckbox
            defaultSave={saveNew}
            onSaveToggle={setSaveNew}
            submitLabel="Use This Address"
          />
        </div>
      )}

      {/* Delivery Timing: Order Now vs Schedule */}
      <div className="mt-6 mb-2">
        <h2 className="font-bold text-sm text-text-primary mb-3">Delivery Timing</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDeliveryTiming("now")}
            className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
              deliveryTiming === "now"
                ? "bg-[#E8F5E9] border-2 border-[#2ECC71]"
                : "bg-surface border-2 border-transparent shadow-card"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              deliveryTiming === "now" ? "bg-[#2ECC71]" : "bg-gray-100"
            }`}>
              <Zap size={20} className={deliveryTiming === "now" ? "text-white" : "text-text-secondary"} />
            </div>
            <span className={`text-sm font-bold ${deliveryTiming === "now" ? "text-[#2ECC71]" : "text-text-primary"}`}>
              Order Now
            </span>
            <span className="text-text-secondary text-[10px] text-center">30-45 min delivery</span>
          </button>

          <button
            onClick={() => setDeliveryTiming("schedule")}
            className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
              deliveryTiming === "schedule"
                ? "bg-primary-light border-2 border-primary"
                : "bg-surface border-2 border-transparent shadow-card"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              deliveryTiming === "schedule" ? "bg-primary" : "bg-gray-100"
            }`}>
              <Calendar size={20} className={deliveryTiming === "schedule" ? "text-white" : "text-text-secondary"} />
            </div>
            <span className={`text-sm font-bold ${deliveryTiming === "schedule" ? "text-primary" : "text-text-primary"}`}>
              Schedule
            </span>
            <span className="text-text-secondary text-[10px] text-center">Pick date & time</span>
          </button>
        </div>

        {/* Inline Schedule Picker */}
        {deliveryTiming === "schedule" && (
          <div className="mt-4 bg-surface shadow-card rounded-xl p-4">
            <h3 className="font-bold text-xs text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              Select Date
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {scheduleDays.map((day) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex flex-col items-center py-2.5 px-1.5 rounded-xl text-center transition-colors ${
                    selectedDate === day.date
                      ? "bg-primary text-white"
                      : "bg-background text-text-primary hover:bg-primary-light"
                  }`}
                >
                  <span className={`text-[9px] font-semibold uppercase ${
                    selectedDate === day.date ? "text-white/80" : "text-text-secondary"
                  }`}>{day.dayName}</span>
                  <span className="text-xs font-bold mt-0.5">{day.label}</span>
                </button>
              ))}
            </div>

            <h3 className="font-bold text-xs text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              Select Time
            </h3>
            <div className="flex flex-col gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left ${
                    selectedTime === slot
                      ? "bg-primary-light border-2 border-primary"
                      : "bg-background border-2 border-transparent"
                  }`}
                >
                  <Clock size={14} className={selectedTime === slot ? "text-primary" : "text-text-secondary"} />
                  <span className={`text-sm font-semibold ${
                    selectedTime === slot ? "text-primary" : "text-text-primary"
                  }`}>{slot}</span>
                </button>
              ))}
            </div>

            {selectedDate && selectedTime && (
              <div className="bg-[#E8F5E9] rounded-xl p-3 mt-3">
                <p className="text-xs font-bold text-[#2ECC71] text-center">
                  Scheduled: {scheduleDays.find((d) => d.date === selectedDate)?.dayName}, {scheduleDays.find((d) => d.date === selectedDate)?.label} at {selectedTime}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-background min-h-screen pb-36">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Delivery Address" />
        <div className="max-w-md mx-auto px-4 pt-4">
          {content}
        </div>
        <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto border-t border-gray-100">
          <Button
            variant="primary"
            fullWidth
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Continue to Payment
          </Button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Choose Delivery Address</h1>
          {content}
          <div className="max-w-md mx-auto mt-8">
            <Button
              variant="primary"
              fullWidth
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
