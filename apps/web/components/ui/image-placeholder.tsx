export function ImagePlaceholder({label,className=""}:{label:string;className?:string}) {
 return <div className={`ph ${className}`} role="img" aria-label={label}><span>{label}</span></div>;
}
