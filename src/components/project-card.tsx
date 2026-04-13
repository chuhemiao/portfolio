import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  link,
  image,
  video,
  links,
  className,
}: Props) {
  const projectHref = href || "#";

  return (
    <Card
      className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-border/60 bg-background/80 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.55)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_28px_55px_-34px_rgba(15,23,42,0.72)]"
    >
      <Link href={projectHref} className={cn("block cursor-pointer", className)}>
        {video && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/70 via-background/10 to-transparent opacity-80" />
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="pointer-events-none mx-auto h-44 w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        )}
        {image && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/70 via-background/10 to-transparent opacity-80" />
            <Image
              src={image}
              alt={title}
              width={500}
              height={300}
              className="h-44 w-full overflow-hidden object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        )}
      </Link>
      <CardHeader className="space-y-4 px-5 pb-0 pt-5">
        <div className="flex items-start justify-between gap-3">
          <time className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-muted-foreground">
            {dates}
          </time>
          <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
        </div>
        <div className="space-y-3">
          <CardTitle className="text-lg leading-tight tracking-[-0.03em]">
            {title}
          </CardTitle>
          <div className="hidden font-sans text-xs underline print:visible">
            {link?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>
          <div className="prose max-w-full text-pretty font-sans text-sm leading-6 text-muted-foreground dark:prose-invert [&>p]:m-0">
            <Markdown>{description}</Markdown>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-5 pt-5">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => (
              <Badge
                className="rounded-full border border-border/60 bg-secondary/70 px-2 py-1 text-[11px] font-medium text-secondary-foreground"
                variant="secondary"
                key={tag}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-4">
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-2">
            {links?.map((link, idx) => (
              <Link href={link?.href} key={idx} target="_blank">
                <Badge
                  key={idx}
                  className="rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground"
                >
                  <span className="flex items-center gap-1.5">
                    {link.icon}
                    {link.type}
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
