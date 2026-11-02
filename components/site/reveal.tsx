"use client";

import * as React from "react";

/** Fades children in when they scroll into view. */
export function Reveal({ as: Tag = "div", delay = 0, className, children, ...rest }: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType; delay?: number }) {
  const ref = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.setAttribute("data-shown", "");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className ?? ""}`} style={{ transitionDelay: delay ? `${delay}ms` : undefined }} {...rest}>
      {children}
    </Tag>
  );
}
