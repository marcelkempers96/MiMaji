"use client";

import EditorialLayout from "@/components/EditorialLayout";
import { Section, Prose, FactList } from "@/components/editorial";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <EditorialLayout
      topBarTitle="Cookie Policy"
      eyebrow="Policy"
      title="Cookies on mimaji.co.ke"
      standfirst="A short account of what we store on your device, why, and how to stop us. We keep this deliberately brief, because a policy nobody finishes is not consent."
      meta="Last updated 17 March 2026 · Operated by MiMaji, Nairobi"
    >
      <Section title="What we set, and why">
        <Prose>
          <p>
            Cookies are small files a site leaves on your browser. Ours fall into three
            groups, and only the first is unavoidable.
          </p>
        </Prose>
        <FactList
          items={[
            {
              term: "Strictly necessary",
              detail:
                "Session handling, navigation and basic security. The site cannot work without these, so they cannot be switched off. They hold no advertising data.",
            },
            {
              term: "Analytics",
              detail:
                "Which pages are read, for how long, and where visitors arrive from. We use this to decide what to fix. It does not identify you.",
            },
            {
              term: "Functional",
              detail:
                "Choices you have already made — your area, your recent searches — so you are not asked twice.",
            },
          ]}
        />
      </Section>

      <Section title="What we do not do">
        <Prose>
          <p>
            We do not sell data. We do not run advertising cookies or cross-site tracking
            pixels. Ordering and payment run through M-Pesa and the MiMaji app, so no
            cookie on this site touches payment details.
          </p>
        </Prose>
      </Section>

      <Section title="Turning them off">
        <Prose>
          <p>
            Every major browser can block cookies, accept them, or ask each time — the
            control sits in its settings, usually under Privacy. Blocking the strictly
            necessary group will break parts of the site; blocking the other two will not.
          </p>
          <p>
            We also use Google Analytics, which sets cookies of its own under Google&apos;s
            policies rather than ours.
          </p>
        </Prose>
      </Section>

      <Section title="Changes and questions">
        <Prose>
          <p>
            If this policy changes, the date at the top changes with it. Questions go to{" "}
            <a href="mailto:privacy@mimaji.co.ke" className="text-[#2979C1] hover:underline">
              privacy@mimaji.co.ke
            </a>
            .
          </p>
          <p>
            See also our{" "}
            <Link href="/privacy" className="text-[#2979C1] hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-[#2979C1] hover:underline">
              Terms of Use
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </EditorialLayout>
  );
}
