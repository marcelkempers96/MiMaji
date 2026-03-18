"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  popular?: boolean;
}

const plans: Plan[] = [
  { id: "basic", name: "Basic Plan", description: "20 Jugs / Month", price: 2800 },
  { id: "standard", name: "Standard Plan", description: "40 Jugs / Month", price: 4800, popular: true },
  { id: "premium", name: "Premium Plan", description: "60 Jugs / Month", price: 6500 },
];

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Subscription Plan" />

      <div className="px-4 pt-4">
        <h2 className="text-[16px] font-bold text-text-primary">Monthly Water Plan</h2>
        <p className="text-text-secondary text-sm mb-4">40 Gallons / Month</p>

        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`bg-surface shadow-card rounded-xl p-4 cursor-pointer flex items-center justify-between ${
                selectedPlan === plan.id ? "border-2 border-primary" : "border-2 border-transparent"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{plan.name}</span>
                  {plan.popular && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm">{plan.description}</p>
              </div>
              <span className="font-bold text-text-primary">
                KES {plan.price.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <Button fullWidth className="mt-6">
          Select Plan
        </Button>
      </div>
    </div>
  );
}
