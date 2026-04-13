import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Props {
  title: string;
  description: string;
  dates: string;
  location: string;
  image?: string;
  links?: readonly {
    icon: React.ReactNode;
    title: string;
    href: string;
  }[];
}

export function HackathonCard({
  title,
  description,
  dates,
  location,
  image,
  links,
}: Props) {
  return (
    <li className="group rounded-[1.45rem] border border-border/60 bg-background/78 p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.6)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_28px_48px_-32px_rgba(15,23,42,0.7)]">
      <div className="flex gap-4">
        <div className="flex-none">
          <div className="rounded-2xl bg-white/95 p-1 ring-1 ring-black/5 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.45)]">
            <Avatar className="size-14 rounded-[1rem] bg-background">
              <AvatarImage src={image} alt={title} className="object-contain" />
              <AvatarFallback>{title[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold leading-tight text-foreground">
                {title}
              </h2>
              {location && (
                <p className="text-sm text-muted-foreground">{location}</p>
              )}
            </div>
            {dates && (
              <time className="max-w-full self-start rounded-full border border-border/70 bg-background/85 px-2.5 py-1 text-[11px] font-medium leading-5 tracking-[0.04em] text-muted-foreground whitespace-normal break-words xl:max-w-[13rem]">
                {dates}
              </time>
            )}
          </div>
          {description && (
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
          {links && links.length > 0 && (
            <div className="flex flex-row flex-wrap items-start gap-2">
              {links?.map((link, idx) => (
                <Link href={link.href} key={idx} target="_blank">
                  <Badge
                    key={idx}
                    title={link.title}
                    className="rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground"
                  >
                    <span className="flex items-center gap-1.5">
                      {link.icon}
                      {link.title}
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
