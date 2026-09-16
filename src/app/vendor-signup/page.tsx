"use client";

import Link from "next/link";
import EditorialLayout from "@/components/EditorialLayout";
import { Section, Prose, Pull, FactList } from "@/components/editorial";
import { SUPPORT_WHATSAPP_NUMBER, SUPPORT_PHONE_DISPLAY } from "@/lib/contact";

const APPLY_MESSAGE = `Hi MiMaji, I would like to apply as a vendor partner.

1. Business name:
2. Areas you cover:
3. Sizes you stock:
4. Delivery hours:
5. Business registration number:`;

export default function VendorSignupPage() {
  return (
    <EditorialLayout
      topBarTitle="Become a Vendor"
      eyebrow="Partner with us"
      title="Orders for the rounds you already run"
      standfirst="If you deliver water in Nairobi, MiMaji sends you customers in the areas you already cover — without taking over your business, your pricing structure or your relationships."
    >
      <Section title="What this is, plainly">
        <Prose>
          <p>
            MiMaji is not a competitor with a fleet. We take the order, confirm the address and
            the payment, and pass it to a vendor who serves that area. You deliver. You keep
            running your own business.
          </p>
          <p>
            What we ask in return is consistency: the published price, the agreed sizes, and
            water you can account for. Customers are choosing MiMaji because those three things
            are predictable, so they have to be predictable from every vendor.
          </p>
        </Prose>
        <Pull>
          You bring the round and the local knowledge. We bring the orders and the paperwork.
        </Pull>
      </Section>

      <Section title="How orders reach you">
        <Prose>
          <p>
            When an order comes in, it is matched to a vendor by area, by the sizes you stock,
            and by the customer&apos;s brand preference where they have one. It arrives in your
            vendor portal with the address, the items and the delivery window.
          </p>
          <p>
            You can decline. Declining passes the order to the next vendor rather than leaving
            the customer waiting, so it costs you that job and nothing else.
          </p>
        </Prose>
      </Section>

      <Section title="What you need to join">
        <FactList
          items={[
            {
              term: "A registered business",
              detail: "Business registration number, and the phone numbers you actually answer.",
            },
            {
              term: "Areas you can serve",
              detail:
                "Which of the 48 Nairobi areas you cover reliably. Better to list four you can always reach than twelve you sometimes can.",
            },
            {
              term: "Stock and sizes",
              detail:
                "Which sizes you hold — 5L to 20L, soft bottles and hard jugs — and whether you handle refills, new bottles or both.",
            },
            {
              term: "Working hours",
              detail:
                "Your genuine delivery window per day. Orders are matched against it, so an accurate one means fewer jobs you have to decline.",
            },
            {
              term: "Water you can trace",
              detail:
                "Where the water is drawn and current test results. This is not negotiable — it is the entire proposition to the customer.",
            },
          ]}
        />
      </Section>

      <Section title="What it costs you">
        <Prose>
          <p>
            There is no joining fee and no monthly charge. You are paid for the water at the
            published rate.
          </p>
          <p>
            The real cost is the standard. Prices are fixed, so you cannot quote differently per
            customer, and a delivery you accept is one you are expected to make.
          </p>
        </Prose>
      </Section>

      <Section title="Applying">
        <Prose>
          <p>
            Send us the five details above and we will come back to you. Vetting is deliberately
            slow — we are onboarding carefully rather than signing everyone, because one vendor
            who cannot account for their water costs every other vendor on the network.
          </p>
          <p>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(APPLY_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2979C1] hover:underline font-semibold"
            >
              Apply on WhatsApp
            </a>{" "}
            — the message opens pre-filled — or call {SUPPORT_PHONE_DISPLAY}. Already a partner?{" "}
            <Link href="/vendor-login" className="text-[#2979C1] hover:underline">
              Sign in to the vendor portal
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </EditorialLayout>
  );
}
