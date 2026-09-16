"use client";

import Link from "next/link";
import EditorialLayout from "@/components/EditorialLayout";
import { Section, Prose, Pull, Figures, FactList } from "@/components/editorial";

export default function ImpactPage() {
  return (
    <EditorialLayout
      topBarTitle="Our Impact"
      eyebrow="Impact"
      title="Ten litres in every hundred"
      standfirst="For every 100 litres ordered in Nairobi, 10 litres go to communities that have none. It is written into the price rather than paid out of whatever is left at year end."
    >
      <Section title="Why a fixed share, not a donation">
        <Prose>
          <p>
            Corporate giving usually depends on a good year. A share of revenue does not. It
            means the commitment is the same in a slow month as in a strong one, and that
            anyone can check the arithmetic: order 100 litres, and 10 are accounted for
            elsewhere.
          </p>
          <p>
            It also means we cannot quietly stop. The contribution is a function of sales, so
            the only way to reduce it is to sell less.
          </p>
        </Prose>
        <Pull>
          Access to water is not a reward for being in the right postcode.
        </Pull>
      </Section>

      <Section title="Where the ten litres go">
        <Prose>
          <p>
            The MiMaji Foundation directs that volume to rural communities in Kenya, where the
            constraint is rarely a single delivery and almost always the infrastructure behind
            it — a borehole that needs servicing, a tank that needs replacing, a school with no
            clean supply at all.
          </p>
          <p>
            Delivering bottled water to a village is a gesture. Keeping a source working is the
            useful version, so the contribution is weighted towards supply that lasts beyond the
            day it arrives.
          </p>
        </Prose>
        <FactList
          items={[
            {
              term: "The ratio",
              detail:
                "10 litres contributed for every 100 litres ordered. Applied to volume, not to margin, so it does not move with our costs.",
            },
            {
              term: "Who it reaches",
              detail:
                "Rural communities in Kenya without reliable access to safe drinking water.",
            },
            {
              term: "What it funds",
              detail:
                "Supply that persists — maintained sources and storage — rather than one-off drops.",
            },
            {
              term: "How it is triggered",
              detail:
                "Automatically, by the order itself. No opt-in, no round-up at checkout, no surcharge.",
            },
          ]}
        />
      </Section>

      <Section title="What your order adds up to">
        <Prose>
          <p>
            A household ordering two 20L jugs a week contributes roughly 200 litres a year
            without doing anything beyond buying the water it already needed. An office on a
            standing weekly delivery contributes considerably more.
          </p>
        </Prose>
        <Figures
          items={[
            { value: "10%", label: "Of every litre ordered" },
            { value: "40L", label: "Two 20L jugs a week, contributed yearly" },
            { value: "0", label: "Added to your bill for it" },
            { value: "48", label: "Nairobi areas the model runs in" },
          ]}
        />
        <Prose>
          <p>
            The second figure is the one worth sitting with. It is not a large number for one
            household. It is a large number for a city of them.
          </p>
        </Prose>
      </Section>

      <Section title="Being straight about the limits">
        <Prose>
          <p>
            This does not solve Kenya&apos;s water problem, and we would rather say so than imply
            otherwise. It is one company routing a fixed share of what it sells towards the
            people least likely to be served by a delivery network.
          </p>
          <p>
            What makes it worth doing is that it grows on its own terms. Every new customer in
            Kilimani or Kasarani raises the contribution without a board having to approve it.
          </p>
        </Prose>
      </Section>

      <Section title="Take part by ordering">
        <Prose>
          <p>
            There is no separate donation to make.{" "}
            <Link href="/buy" className="text-[#2979C1] hover:underline font-semibold">
              Order water
            </Link>{" "}
            and the share is already counted. To understand how the water itself is checked, see{" "}
            <Link href="/know-your-water" className="text-[#2979C1] hover:underline">
              Know Your Water
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </EditorialLayout>
  );
}
