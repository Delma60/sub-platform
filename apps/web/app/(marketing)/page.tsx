import Link from "next/link";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DELIVERY_INDEX = 3;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased">
      {/* header block removed — now provided by (marketing)/layout.tsx */}

      <section className="px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              Weekly market delivery
            </p>

            <h1 className="mt-5 text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.02em] sm:text-[3.75rem]">
              Fresh foodstuff, delivered on schedule.
            </h1>

            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[var(--ink-soft)]">
              Tomatoes, peppers, onions, yam, garri and more — sourced from
              farms and wholesalers across Ogun, Oyo and Lagos, packed and
              delivered on the day you choose.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link
                href="#plans"
                className="rounded-md bg-[var(--accent)] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#243020]"
              >
                See subscription plans
              </Link>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4 transition hover:decoration-[var(--ink)]"
              >
                How it works
              </a>
            </div>

            <div className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-[var(--line)] pt-6">
              <Stat label="Farms sourced from" value="40+" />
              <Stat label="Items per box" value="6–25" />
              <Stat label="Cancel anytime" value="Yes" />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              This week&apos;s box
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              Family plan · 15 items
            </p>

            <WeekTrack deliveryIndex={DELIVERY_INDEX} />

            <ul className="mt-8 flex flex-col divide-y divide-[var(--line)]">
              {[
                "Tomatoes & pepper mix",
                "Rice, beans & garri",
                "Palm oil & crayfish",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 py-3 text-[14px] text-[var(--ink)]"
                >
                  <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-[var(--line)] px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Process
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
            How it works
          </h2>

          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Pick your plan",
                copy: "Choose Single, Family, or Bulk, and set how often you want deliveries.",
              },
              {
                n: "02",
                title: "We source & pack",
                copy: "Our team buys fresh from trusted farmers and wholesalers, then hand-packs your box.",
              },
              {
                n: "03",
                title: "Delivered to your door",
                copy: "Your box arrives on your chosen day. Skip, pause, or swap items anytime.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t border-[var(--line)] pt-6">
                <span className="text-[13px] text-[var(--ink-soft)]">
                  {step.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="whats-inside"
        className="border-t border-[var(--line)] px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              Contents
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
              What&apos;s in the box
            </h2>
            <p className="mt-4 text-[var(--ink-soft)]">
              Every plan is built around these categories. Once you subscribe,
              you can swap items to fit your kitchen.
            </p>
          </div>

          <div className="mt-14 grid gap-10 border-t border-[var(--line)] pt-10 md:grid-cols-3">
            {[
              {
                cat: "Vegetables",
                items: [
                  "Tomatoes",
                  "Tatashe & rodo pepper",
                  "Onions",
                  "Ugu & spinach",
                  "Ginger & garlic",
                ],
              },
              {
                cat: "Grains & staples",
                items: ["Rice", "Beans", "Garri", "Yam", "Semovita"],
              },
              {
                cat: "Pantry",
                items: [
                  "Palm oil",
                  "Groundnut oil",
                  "Crayfish",
                  "Stock fish",
                  "Seasoning cubes",
                ],
              },
            ].map((group) => (
              <div key={group.cat}>
                <h3 className="text-[15px] font-semibold text-[var(--ink)]">
                  {group.cat}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="text-[15px] text-[var(--ink-soft)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="border-t border-[var(--line)] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
            Plans for every kitchen
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Single",
                price: "₦15,000",
                desc: "For one or two people cooking at home.",
                features: [
                  "6–8 staple items",
                  "Monthly delivery",
                  "Pause anytime",
                ],
                highlight: false,
              },
              {
                name: "Family",
                price: "₦28,000",
                desc: "The most popular box for households of 3–5.",
                features: [
                  "14–16 staple items",
                  "Weekly or bi-weekly delivery",
                  "Swap up to 3 items",
                  "Priority delivery slots",
                ],
                highlight: true,
              },
              {
                name: "Bulk",
                price: "₦45,000",
                desc: "For larger households or small food businesses.",
                features: [
                  "25+ items, larger quantities",
                  "Weekly delivery",
                  "Full item customization",
                  "Dedicated support line",
                ],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg bg-[var(--surface)] p-8 ${
                  plan.highlight
                    ? "border border-[var(--accent)]"
                    : "border border-[var(--line)]"
                }`}
              >
                {plan.highlight && (
                  <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--accent)]">
                    Popular
                  </span>
                )}
                <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  {plan.desc}
                </p>

                <p className="mt-6">
                  <span className="text-4xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[var(--ink-soft)]">
                    {" "}
                    / month
                  </span>
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-[var(--ink)]"
                    >
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/checkout?plan=${plan.name.toLowerCase()}`}
                  className={`mt-8 block rounded-md px-6 py-3 text-center text-sm font-medium transition ${
                    plan.highlight
                      ? "bg-[var(--accent)] text-white hover:bg-[#243020]"
                      : "border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--accent-soft)]"
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Feedback
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
            From kitchens like yours
          </h2>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                quote:
                  "I used to lose my whole Saturday morning to Mile 12. Now the box just shows up, fresher than what I'd have picked myself.",
                name: "Adaeze O.",
                loc: "Lekki, Lagos",
              },
              {
                quote:
                  "The Family plan covers almost everything I need for the week. I just top up protein separately.",
                name: "Tunde A.",
                loc: "Yaba, Lagos",
              },
              {
                quote:
                  "Being able to swap items before delivery is what sold me — no more garri sitting unused in the pantry.",
                name: "Chiamaka N.",
                loc: "Ikeja, Lagos",
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="border-t border-[var(--line)] pt-6"
              >
                <blockquote className="text-[16px] leading-relaxed text-[var(--ink-soft)]">
                  &quot;{t.quote}&quot;
                </blockquote>
                <figcaption className="mt-5 text-sm text-[var(--ink-soft)]">
                  {t.name} — {t.loc}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
            Ready to skip your next market run?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--ink-soft)]">
            Set up your subscription in under three minutes. Cancel or pause
            anytime.
          </p>
          <Link
            href="#plans"
            className="mt-8 inline-block rounded-md bg-[var(--accent)] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#243020]"
          >
            Start your subscription
          </Link>
        </div>
      </section>

      <footer id="faq" className="px-6 py-14">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 pb-10 md:flex-row">
          <div className="max-w-xs">
            <span className="text-lg font-semibold">Oja</span>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Fresh foodstuff, sourced direct and delivered on your schedule.
            </p>
          </div>
          <div className="flex gap-16 text-sm text-[var(--ink-soft)]">
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] uppercase tracking-wide text-[var(--ink-soft)]">
                Product
              </span>
              <a href="#how-it-works" className="hover:text-[var(--ink)]">
                How it works
              </a>
              <a href="#plans" className="hover:text-[var(--ink)]">
                Plans
              </a>
              <a href="#whats-inside" className="hover:text-[var(--ink)]">
                What&apos;s inside
              </a>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] uppercase tracking-wide text-[var(--ink-soft)]">
                Company
              </span>
              <a href="/about" className="hover:text-[var(--ink)]">
                About
              </a>
              <a href="/contact" className="hover:text-[var(--ink)]">
                Contact
              </a>
              <a href="/terms" className="hover:text-[var(--ink)]">
                Terms
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 border-t border-[var(--line)] pt-6 text-xs text-[var(--ink-soft)] sm:flex-row">
          <p>© {new Date().getFullYear()} Oja. All rights reserved.</p>
          <p>Payments secured by Flutterwave</p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-semibold text-[var(--ink)]">{value}</p>
      <p className="mt-1 text-[12px] text-[var(--ink-soft)]">{label}</p>
    </div>
  );
}

function WeekTrack({ deliveryIndex }: { deliveryIndex: number }) {
  return (
    <div className="mt-6">
      <div className="relative h-px bg-[var(--line)]">
        <div
          className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
          style={{ left: `${(deliveryIndex / (WEEK.length - 1)) * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
        {WEEK.map((day, i) => (
          <span
            key={day}
            className={i === deliveryIndex ? "text-[var(--ink)]" : ""}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-0.5 shrink-0 text-[var(--accent)]"
    >
      <path
        d="M3 8.5L6 11.5L13 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
