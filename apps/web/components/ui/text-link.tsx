import Link from "next/link";
export function TextLink({href="#",children}:{href?:string;children:React.ReactNode}) {
 return <Link href={href} className="textlink">{children}<i aria-hidden>→</i></Link>;
}
