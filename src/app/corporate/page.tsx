"use client";

import Link from "next/link";
import EditorialLayout from "@/components/EditorialLayout";
import { Section, Prose, Pull, FactList, Figures } from "@/components/editorial";
import { SUPPORT_WHATSAPP_NUMBER, SUPPORT_PHONE_DISPLAY } from "@/lib/contact";

export default function CorporatePage() {
  return (
    <EditorialLayout
      topBarTitle="Corporate"
      eyebrow="For offices"
      title="Water your office stops having to think about"
      standfirst="Scheduled deliveries, one price list, and a monthly invoice instead of a drawer of M-Pesa messages. Built for the person who currently notices the water only when it runs out."
    >
      <Section title="The job nobody was hired to do">
        <Prose>
          <p>
            In most offices, water is somebody&apos;s unofficial responsibility. They notice the
            last jug going on Thursday, message a vendor, chase the delivery, pay from their own
            line, and file the receipt for reimbursement. It works until they are on leave.
          </p>
          <p>
            A corporate account removes the whole loop. Delivery runs to a schedule you set, the
            price is fixed in advance, and accounts receive one invoice rather than fifteen
            payment confirmations.
          </p>
        </Prose>
        <Pull>
          The goal is that nobody in the building has to think about water again.
        </Pull>
      </Section>

      <Section title="What an account gives you">
        <FactList
          items={[
            {
              term: "Scheduled delivery",
              detail:
                "Pick the days and a window. Deliveries repeat without anyone reordering. Change or pause the schedule whenever the office calendar changes.",
            },
            {
              term: "Volume pricing",
              detail:
                "Discounts begin at three jugs and reach 20%. Standing orders are priced on the whole month rather than per delivery.",
            },
            {
              term: "Monthly invoicing",
              detail:
                "One statement covering the period, itemised by delivery, with your registration details on it. Suitable for filing rather than for forwarding.",
            },
            {
              term: "Dispenser-ready sizes",
              detail:
                "18.9L and 20L hard jugs fit standard coolers. Soft bottles from 5L for meeting rooms and small kitchens.",
            },
            {
              term: "One point of contact",
              detail:
                "A named contact for the account, not a general queue — so a missed delivery is a message, not a ticket.",
            },
          ]}
        />
      </Section>

      <Section title="Sizing it honestly">
        <Prose>
          <p>
            A rough figure most offices land near: two litres per person per working day, plus
            a margin for visitors and the kettle. Twenty people is around 200 litres a week, or
            ten 20L jugs.
          </p>
          <p>
            We would rather set the schedule slightly low and add a delivery than sell you
            storage you do not need. Jugs standing unused are cost, not resilience.
          </p>
        </Prose>
        <Figures
          items={[
            { value: "2L", label: "Per person, per working day" },
            { value: "10", label: "20L jugs a week for twenty people" },
            { value: "20%", label: "Maximum volume discount" },
            { value: "48", label: "Nairobi areas covered" },
          ]}
        />
      </Section>

      <Section title="Beyond the cooler">
        <Prose>
          <p>
            Some sites need more than jugs. We also arrange bulk tank delivery by truck and
            tank cleaning, for buildings running their own storage.
          </p>
          <p>
            These are quoted per site rather than listed, because access, tank size and the
            state of the existing storage decide the price more than volume does.
          </p>
        </Prose>
      </Section>

      <Section title="Setting one up">
        <Prose>
          <p>
            Tell us the address, the headcount and how often you want deliveries. We come back
            with a schedule and a monthly figure. Nothing is charged until the first delivery
            lands.
          </p>
          <p>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "Hi MiMaji, I would like to set up a corporate water account for our office."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2979C1] hover:underline font-semibold"
            >
              Start on WhatsApp
            </a>{" "}
            or call {SUPPORT_PHONE_DISPLAY}. To try the service first,{" "}
            <Link href="/buy" className="text-[#2979C1] hover:underline">
              place a single order
            </Link>{" "}
            and see how a delivery actually goes.
          </p>
        </Prose>
      </Section>
    </EditorialLayout>
  );
}
