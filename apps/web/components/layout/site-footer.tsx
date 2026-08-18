import Link from "next/link";
export function SiteFooter(){return <footer><div className="shell footerGrid">
 <div><p className="eyebrow soft">Science · Research · Innovation</p><h3>UPNG SRIS</h3><p className="soft">Go beyond the classroom.</p></div>
 <div className="footerLinks">
  <div><b>About</b><Link href="/about">About SRIS</Link><Link href="/about/mission-vision">Mission & Vision</Link><Link href="/about/team">Our People</Link></div>
  <div><b>Research</b><Link href="/explore/research">Projects</Link><Link href="/explore/research">Publications</Link><Link href="/community/showcase">Student Showcase</Link></div>
  <div><b>Community</b><Link href="/community/events">Events</Link><Link href="/community/membership">Membership</Link><Link href="/learn/articles">News</Link></div>
 </div></div><div className="shell copyright">Science, Research & Innovation Society · University of Papua New Guinea</div></footer>}
