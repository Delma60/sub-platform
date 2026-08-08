import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF6EF] text-[#17251C] font-body antialiased">
      <header className="sticky top-0 z-50 border-b border-[#E4DCC8] bg-[#FAF6EF]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-2xl text-[#17251C]">
            Oja
          </Link>

          <input type="checkbox" id="nav-toggle" className="peer hidden" />

          <nav className="hidden items-center gap-9 text-[13px] font-medium uppercase tracking-[0.08em] text-[#6B6558] md:flex">
            <a href="#how-it-works" className="transition hover:text-[#17251C]">
              How it works
            </a>
            <a href="#whats-inside" className="transition hover:text-[#17251C]">
              What's inside
            </a>
            <a href="#plans" className="transition hover:text-[#17251C]">
              Plans
            </a>
            <a href="#faq" className="transition hover:text-[#17251C]">
              FAQ
            </a>
          </nav>

          <Link
            href="/auth/login"
            className="hidden text-[13px] font-medium text-[#17251C] transition hover:text-[#24402F] md:inline-block"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="hidden rounded-md bg-[#24402F] px-5 py-2.5 text-[13px] font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22] md:inline-block"
          >
            Start your subscription
          </Link>

          <label
            htmlFor="nav-toggle"
            className="flex cursor-pointer flex-col gap-1.5 md:hidden"
            aria-label="Toggle menu"
          >
            <span className="h-px w-6 bg-[#17251C]" />
            <span className="h-px w-6 bg-[#17251C]" />
            <span className="h-px w-6 bg-[#17251C]" />
          </label>
        </div>

        <div className="hidden max-h-0 overflow-hidden border-t border-[#E4DCC8] px-6 transition-all peer-checked:block peer-checked:max-h-80 peer-checked:py-5 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-[#17251C]">
            <a href="#how-it-works">How it works</a>
            <a href="#whats-inside">What's inside</a>
            <a href="#plans">Plans</a>
            <a href="#faq">FAQ</a>
            <Link
              href="/auth/login"
              className="mt-2 text-sm font-medium text-[#17251C] hover:text-[#24402F]"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="mt-2 rounded-md bg-[#24402F] px-5 py-3 text-center text-sm font-medium text-[#FAF6EF]"
            >
              Start your subscription
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-[#BC8A31]">
              Weekly market delivery
            </p>

            <h1 className="mt-5 font-display text-[2.75rem] leading-[1.08] text-[#17251C] sm:text-6xl">
              Fresh foodstuff,
              <br />
              <span className="italic">sourced and delivered</span>
              <br />
              for you.
            </h1>

            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#6B6558]">
              Tomatoes, peppers, onions, yam, garri and more — bought directly
              from farms and wholesalers across Ogun, Oyo and Lagos, then
              delivered to your door on a schedule you choose.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="#plans"
                className="rounded-md bg-[#24402F] px-7 py-3.5 text-sm font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22]"
              >
                See subscription plans
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-md border border-[#17251C]/15 px-7 py-3.5 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
              >
                How it works
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#E4DCC8] pt-7 text-[13px] text-[#6B6558]">
              <span className="flex items-center gap-2">
                <CheckIcon /> Secure checkout via Flutterwave
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon /> Sourced from 40+ farms directly
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon /> Pause or cancel anytime
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-3 grid-rows-3 gap-3">
              <div className="col-span-2 row-span-2 rounded-2xl bg-[#DCD0B7] shadow-sm" />
              <div className="rounded-2xl bg-[#24402F] shadow-sm" />
              <div className="rounded-2xl bg-[#FAF6EF] shadow-sm" />
              <div className="col-span-2 rounded-2xl bg-[#BC8A31]/10 shadow-sm ring-1 ring-[#BC8A31]/15" />
              <div className="rounded-2xl bg-[#17251C] shadow-sm" />
              <div className="col-span-2 rounded-2xl bg-[#FAF6EF] shadow-sm" />
            </div>

            <div className="absolute -bottom-5 left-5 rounded-lg border border-[#E4DCC8] bg-[#FAF6EF] px-5 py-3 shadow-md">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6558]">
                This week's box
              </p>
              <p className="font-display text-lg text-[#17251C]">
                Family Plan — 15 items
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#17251C] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-[#BC8A31]">
            Process
          </p>
          <h2 className="mt-3 font-display text-3xl text-[#FAF6EF] sm:text-4xl">
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
              <div key={step.n} className="border-t border-[#FAF6EF]/15 pt-6">
                <span className="font-display text-2xl text-[#BC8A31]">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl text-[#FAF6EF]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#FAF6EF]/55">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="whats-inside" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-[#BC8A31]">
              Contents
            </p>
            <h2 className="mt-3 font-display text-3xl text-[#17251C] sm:text-4xl">
              What's in the box
            </h2>
            <p className="mt-4 max-w-xl text-[#6B6558]">
              Every plan is built around these categories. Once you subscribe,
              you can swap items to fit your kitchen.
            </p>
          </div>

          <div className="mt-14 grid gap-10 border-t border-[#E4DCC8] pt-10 md:grid-cols-3">
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
                <h3 className="font-display text-lg text-[#17251C]">
                  {group.cat}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-[15px] text-[#6B6558]"
                    >
                      <span className="h-1 w-1 rounded-full bg-[#BC8A31]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="plans"
        className="border-t border-[#E4DCC8] bg-[#F2ECDE] px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-[#BC8A31]">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-3xl text-[#17251C] sm:text-4xl">
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
                className={`rounded-2xl bg-[#FAF6EF] p-8 ${
                  plan.highlight
                    ? "border-2 border-[#24402F] shadow-md"
                    : "border border-[#E4DCC8]"
                }`}
              >
                {plan.highlight && (
                  <span className="mb-4 inline-block rounded-full bg-[#BC8A31] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#FAF6EF]">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-2xl text-[#17251C]">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-[#6B6558]">{plan.desc}</p>

                <p className="mt-6">
                  <span className="font-display text-4xl text-[#17251C]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#6B6558]"> / month</span>
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-[#17251C]"
                    >
                      <CheckIcon /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`mt-8 block rounded-md px-6 py-3 text-center text-sm font-medium transition ${
                    plan.highlight
                      ? "bg-[#24402F] text-[#FAF6EF] hover:bg-[#1a2f22]"
                      : "border border-[#17251C]/15 text-[#17251C] hover:bg-[#17251C]/[0.04]"
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#17251C] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-[#BC8A31]">
            Feedback
          </p>
          <h2 className="mt-3 font-display text-3xl text-[#FAF6EF] sm:text-4xl">
            From kitchens like yours
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
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
                className="border-t border-[#FAF6EF]/15 pt-6"
              >
                <blockquote className="font-display text-lg italic leading-relaxed text-[#FAF6EF]/90">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-5 text-sm text-[#FAF6EF]/50">
                  {t.name} — {t.loc}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#24402F] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl text-[#FAF6EF] sm:text-4xl">
            Ready to skip your next market run?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[#FAF6EF]/70">
            Set up your subscription in under three minutes. Cancel or pause
            anytime.
          </p>
          <Link
            href="#plans"
            className="mt-8 inline-block rounded-md bg-[#BC8A31] px-8 py-4 text-sm font-medium text-[#17251C] transition hover:bg-[#a87b2a]"
          >
            Start your subscription
          </Link>
        </div>
      </section>

      <footer id="faq" className="px-6 py-14">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 border-b border-[#E4DCC8] pb-10 md:flex-row">
          <div className="max-w-xs">
            <span className="font-display text-xl text-[#17251C]">Oja</span>
            <p className="mt-2 text-sm text-[#6B6558]">
              Fresh foodstuff, sourced direct and delivered on your schedule.
            </p>
          </div>
          <div className="flex gap-16 text-sm text-[#6B6558]">
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] uppercase tracking-wide text-[#6B6558]/70">
                Product
              </span>
              <a href="#how-it-works" className="hover:text-[#17251C]">
                How it works
              </a>
              <a href="#plans" className="hover:text-[#17251C]">
                Plans
              </a>
              <a href="#whats-inside" className="hover:text-[#17251C]">
                What's inside
              </a>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] uppercase tracking-wide text-[#6B6558]/70">
                Company
              </span>
              <a href="/about" className="hover:text-[#17251C]">
                About
              </a>
              <a href="/contact" className="hover:text-[#17251C]">
                Contact
              </a>
              <a href="/terms" className="hover:text-[#17251C]">
                Terms
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl flex-col justify-between gap-3 text-xs text-[#6B6558]/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Oja. All rights reserved.</p>
          <p>Payments secured by Flutterwave</p>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 text-[#24402F]"
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
