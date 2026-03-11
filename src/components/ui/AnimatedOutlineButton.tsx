"use client";

import Link from "next/link";
import { type ReactNode } from "react";

const base =
  "relative inline-flex items-center justify-center gap-2 border-2 border-white bg-transparent px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:border-transparent hover:bg-zinc-200 hover:text-black";

/* Outward-pointing triangular tabs on hover (CSS border trick) */
const triangleStyles = `
  .btn-triangle-tabs::before,
  .btn-triangle-tabs::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    border-style: solid;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .btn-triangle-tabs::before {
    left: 0;
    border-width: 10px 14px 10px 0;
    border-color: transparent #27272a transparent transparent;
    transform: translate(-100%, -50%);
  }
  .btn-triangle-tabs::after {
    right: 0;
    border-width: 10px 0 10px 14px;
    border-color: transparent transparent transparent #27272a;
    transform: translate(100%, -50%);
  }
  .btn-triangle-tabs:hover::before,
  .btn-triangle-tabs:hover::after {
    opacity: 1;
  }
`;

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

export function AnimatedOutlineButton({
  children,
  className = "",
  href,
  type = "button",
  onClick,
}: Props) {
  const combined = `${base} btn-triangle-tabs ${className}`.trim();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: triangleStyles }} />
      {href ? (
        <Link href={href} className={combined}>
          {children}
        </Link>
      ) : (
        <button type={type} className={combined} onClick={onClick}>
          {children}
        </button>
      )}
    </>
  );
}
