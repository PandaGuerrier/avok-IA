import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { ExternalLink } from "lucide-react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface BentoGridItemProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  button?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  href: string;
}

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  button,
  href,
}: BentoGridItemProps) => {
  return (
    <a
      href={href}
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border cursor-pointer border-neutral-200 bg-white p-4 transition duration-200 shadow-primary/20 hover:shadow-xl dark:border-white/[0.2] dark:bg-black",
        className,
      )}
    >
      {header}
      <div className={"flex"}>
        <div className="w-full transition duration-200 group-hover/bento:translate-x-2 space-y-2">
          {icon}
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200">
            {title}
          </div>
          <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">
            {description}
          </div>
          {button ? (
            <Button className={"w-full"} href={href}>
              {button}
            </Button>
          ) : (
            <div></div>
          )}
        </div>
        <div className={"items-end flex justify-end py-2"}>
          {!button ? <ExternalLink className={"text-gray-500"} /> : null}
        </div>
      </div>
    </a>
  );
};
