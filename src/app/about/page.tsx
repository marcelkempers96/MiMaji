"use client";

import Link from "next/link";
import EditorialLayout from "@/components/EditorialLayout";
import { Section, Prose, Pull, Figures, FactList } from "@/components/editorial";

export default function AboutUsPage() {
  return (
    <EditorialLayout
      topBarTitle="About Us"
      eyebrow="About"
      title="Water is the one thing nobody should have to plan around"
      standfirst="MiMaji delivers drinking water across Nairobi. We did not set out to build another delivery app — we set out to remove the guesswork from something people buy every week and rarely get to inspect."
    >
      <Section title="The problem is not supply. It is certainty.">
        <Prose>
          <p>
            Nairobi does not lack water vendors. What it lacks is a way to know what you are
            buying. A jug arrives at the gate; the seal looks right; the price is whatever was
            quoted that morning. Where the water was drawn, when the bottle was last cleaned,
            whether anyone tested it — none of that travels with the jug.
          </p>
          <p>
            Most households resolve this by sticking with a vendor they trust and hoping
            nothing changes. That works until the vendor is unavailable, raises the price, or
            hands the round to someone else.
          </p>
        </Prose>
        <Pull>
          We think the reasonable expectation is this: the same price today as last week, and
          an answer when you ask where the water came from.
        </Pull>
      </Section>

      <Section title="What we actually do">
        <Prose>
          <p>
            We are the layer between you and a vetted network of local vendors. You order, we
            route it to a vendor who serves your area and has the size you want in stock, and
            they deliver. You pay on delivery by M-Pesa.
          </p>
          <p>
            The vendors are independent businesses. That is deliberate — they already know the
            estates, the gate procedures and the walk-ups. What we add is a standard they agree
            to hold, a fixed price list, and a record of every order.
          </p>
        </Prose>
        <FactList
          items={[
            {
              term: "Fixed pricing",
              detail:
                "Published per size, the same across the network. A 20L hard jug refill is KES 290 whoever brings it. Delivery is KES 100. Three or more jugs earn up to 20% off.",
            },
            {
              term: "Refill or new",
              detail:
                "Swap an empty bottle for a filled one, or buy a sealed new one. Refilling costs roughly half and keeps a bottle in circulation instead of in a landfill.",
            },
            {
              term: "Coverage",
              detail:
                "48 Nairobi areas, from the CBD and Westlands to Karen, Kasarani and South B.",
            },
            {
              term: "Verification",
              detail:
                "Every MiMaji bottle carries a QR code. Scanning it shows where that water was drawn and its most recent lab results.",
            },
          ]}
        />
      </Section>

      <Section title="The part we will not compromise on">
        <Prose>
          <p>
            Verification is the reason this company exists. A delivery business can be rebuilt;
            a reputation for selling water nobody checked cannot. If we cannot say where a
            batch came from, it does not go out.
          </p>
          <p>
            That is also why the QR code is on the bottle rather than in a brochure. It is
            checkable at the moment it matters — at your door, before you pay.
          </p>
        </Prose>
      </Section>

      <Section title="What the business is for">
        <Prose>
          <p>
            For every 100 litres ordered, 10 litres go to rural communities in Kenya through
            the MiMaji Foundation. It is a fixed share of what we sell rather than a donation
            made when there is money spare, which means it scales with the business instead of
            with our good intentions.
          </p>
        </Prose>
        <Figures
          items={[
            { value: "48", label: "Nairobi areas served" },
            { value: "10%", label: "Of every order to rural supply" },
            { value: "KES 100", label: "Flat delivery, any size" },
            { value: "20%", label: "Off at three jugs or more" },
          ]}
        />
        <Prose>
          <p>
            More on how that works, and where the water goes, on the{" "}
            <Link href="/impact" className="text-[#2979C1] hover:underline">
              Impact page
            </Link>
            .
          </p>
        </Prose>
      </Section>

      <Section title="Start an order">
        <Prose>
          <p>
            Pick a size, choose your area, pay on delivery.{" "}
            <Link href="/buy" className="text-[#2979C1] hover:underline font-semibold">
              Order water
            </Link>
            , see the{" "}
            <Link href="/products" className="text-[#2979C1] hover:underline">
              full price list
            </Link>
            , or read about{" "}
            <Link href="/corporate" className="text-[#2979C1] hover:underline">
              office and corporate accounts
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </EditorialLayout>
  );
}
