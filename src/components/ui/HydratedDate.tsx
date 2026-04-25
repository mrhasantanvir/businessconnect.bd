"use client";

import { useState, useEffect } from "react";

interface HydratedDateProps {
  date: string | Date | number;
  className?: string;
  options?: Intl.DateTimeFormatOptions;
}

export function HydratedDate({ date, className, options }: HydratedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>...</span>;
  }

  try {
    const d = new Date(date);
    return (
      <span className={className}>
        {d.toLocaleString(undefined, options)}
      </span>
    );
  } catch (e) {
    return <span className={className}>Invalid Date</span>;
  }
}
