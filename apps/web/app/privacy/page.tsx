import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/ui/breadcrumb";

import { routes } from "@/lib/route";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy | UPNG SRIS",
  description:
    "What information the Science, Research and Innovation Society website collects, why, and how to ask for it to be removed.",
  path: routes.privacy,
});

/*
 * Describes only what the code actually does: the contact form is the one
 * place visitor data is stored (contact enquiries and membership records, in
 * a private Sanity dataset, and emailed to the team through Resend), there is
 * no analytics, and the contact page embeds a Google map. Update
 * this page whenever any of that changes.
 */
export default function PrivacyPage() {
  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{ label: "Privacy" }]} />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">Privacy</p>

              <h1>How this website handles your information.</h1>
            </div>

            <p className="lead" data-reveal>
              The SRIS website collects as little as it can: only what you
              choose to send through the contact form or the membership
              registration and renewal forms.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="richText" data-reveal>
            <h2>What we collect</h2>

            <p>
              When you send a message through the{" "}
              <Link href={routes.about.contact}>contact form</Link>, we store
              your name, email address, subject and message so the society can
              read and reply to it. Nothing is collected when you simply browse
              the site.
            </p>

            <p>
              When you{" "}
              <Link href={routes.community.membershipRegister}>register</Link>{" "}
              or{" "}
              <Link href={routes.community.membershipRenew}>renew</Link> as a
              member, we store your name, email address and the details for
              your category (for students, year of study, school and major;
              for staff, department and role; for alumni, graduation year and
              occupation; for others, occupation), together with the payment
              method, amount, date and receipt or transaction number you
              enter. You can also upload a photo or PDF of your payment
              receipt as proof of payment; it is stored privately and used
              only to check your payment. We never ask for, and you should
              never enter or upload, card numbers, PINs or passwords.
            </p>

            <h2>How it is used</h2>

            <p>
              Your message is read by the SRIS student team and used only to
              respond to your enquiry. Membership details are used only to
              run the society&rsquo;s membership: to check your payment, to
              approve your registration, to let you renew without re-entering
              your details, and to contact you about your membership. Nothing
              is sold, shared for marketing, or added to a mailing list.
            </p>

            <h2>Where it is stored</h2>

            <p>
              Messages and site content are stored with Sanity, the content
              platform the society uses to manage this website. Images on the
              site are served from Sanity&rsquo;s content delivery network.
            </p>

            <p>
              Messages, member profiles and registration records are kept in a
              separate private Sanity dataset that only the society&rsquo;s
              signed-in executives can open; it is not part of the public
              website content. When you send a message or register, a copy is
              also emailed to the SRIS team (and a confirmation to you for a
              registration) through Resend, a transactional email service.
              That email contains what you entered in the form.
            </p>

            <h2>Cookies and tracking</h2>

            <p>
              This website does not use analytics or advertising cookies. The
              map on the contact page is provided by Google Maps, which may set
              its own cookies when the map loads; Google&rsquo;s privacy policy
              applies to that map.
            </p>

            <h2>Your choices</h2>

            <p>
              To ask what we hold about you, or to have a message you sent
              deleted, get in touch through the{" "}
              <Link href={routes.about.contact}>contact form</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
