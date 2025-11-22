import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { StartupRecord } from "@/lib/types";
import { getInitials } from "@/lib/utils";

type StartupCardProps = {
  startup: StartupRecord;
};

export function StartupCard({ startup }: StartupCardProps) {
  return (
    <Link href={`/startup/${startup.slug}`}>
      <Card className="flex h-full flex-col bg-background">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-base font-semibold uppercase text-zinc-600 overflow-hidden">
            {startup.logo ? (
              <>
                <Image
                  src={startup.logo}
                  alt={`${startup.name} logo`}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)' }} />
              </>
            ) : (
              getInitials(startup.name)
            )}
          </div>
          <CardTitle className="text-lg">{startup.name}</CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}

