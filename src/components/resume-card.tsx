"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string;
}
export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasDescription = Boolean(description);
  const hasHref = Boolean(href && href !== "#");
  const cardBody = (
    <Card
      className={cn(
        "group rounded-[1.35rem] border border-border/60 bg-background/78 p-4 shadow-[0_14px_35px_-32px_rgba(15,23,42,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_26px_50px_-34px_rgba(15,23,42,0.72)]",
        hasDescription && "cursor-pointer"
      )}
    >
      <div className="flex gap-4">
        <div className="flex-none">
          <div className="rounded-2xl bg-white/95 p-1 ring-1 ring-black/5 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.45)]">
            <Avatar className="size-12 rounded-[1rem] bg-background">
              <AvatarImage
                src={logoUrl}
                alt={altText}
                className="object-contain"
              />
              <AvatarFallback>{altText[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold leading-none text-foreground sm:text-[15px]">
                  {title}
                </h3>
                {badges && (
                  <span className="inline-flex flex-wrap gap-1">
                    {badges.map((badge, index) => (
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-border/60 bg-secondary/70 text-[11px]"
                        key={index}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </span>
                )}
              </div>
              {subtitle && (
                <div className="font-sans text-sm text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
              <div className="text-xs tabular-nums text-muted-foreground sm:text-sm">
                {period}
              </div>
              {hasHref && (
                <Link
                  href={href!}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit
                  <ArrowUpRightIcon className="size-3" />
                </Link>
              )}
            </div>
          </div>
          {description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? "auto" : 0,
              }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden text-sm leading-6 text-muted-foreground"
            >
              {description}
            </motion.div>
          )}
          {hasDescription && (
            <div className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <ChevronRightIcon
                className={cn(
                  "size-4 transition-transform duration-300",
                  isExpanded ? "rotate-90" : "rotate-0"
                )}
              />
              {isExpanded ? "Hide details" : "Show details"}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (hasDescription) {
    return (
      <div
        className="block"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        {cardBody}
      </div>
    );
  }

  return cardBody;
};
