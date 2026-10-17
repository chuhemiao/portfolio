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
      className="group flex h-full flex-col overflow-hidden rounded border border-border bg-surface transition-all duration-300 ease-out hover:border-border-strong"
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
              className="pointer-events-none mx-auto h-44 w-full object-cover object-top transition-transform duration-500"
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
              className="h-44 w-full overflow-hidden object-cover object-top transition-transform duration-500"
            />
          </div>
        )}
      </Link>
      <CardHeader className="space-y-4 px-5 pb-0 pt-5">
        <div className="flex items-start justify-between gap-3">
          <time className="rounded-sm border border-border bg-surface px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-muted-foreground">
            {dates}
          </time>
          <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:text-foreground" />
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
                className="rounded-sm border border-border bg-secondary/70 px-2 py-1 text-[11px] font-medium text-secondary-foreground"
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
                  className="rounded-sm border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground"
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
