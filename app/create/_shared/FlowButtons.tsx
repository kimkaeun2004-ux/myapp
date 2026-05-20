import {
  YEOUN_HOME_BTN_HALF_PRIMARY,
  YEOUN_HOME_BTN_HALF_SECONDARY,
  YEOUN_HOME_BTN_OUTLINE,
  YEOUN_HOME_BTN_ROW,
  YEOUN_HOME_CTA,
} from "@/lib/ui/yeoun-scale";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function FlowCtaButton({ className = "", children, ...props }: BtnProps) {
  return (
    <button type="button" className={`${YEOUN_HOME_CTA} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function FlowOutlineButton({ className = "", children, ...props }: BtnProps) {
  return (
    <button type="button" className={`${YEOUN_HOME_BTN_OUTLINE} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function FlowButtonRow({ children }: { children: ReactNode }) {
  return <div className={YEOUN_HOME_BTN_ROW}>{children}</div>;
}

export function FlowPrimaryHalf({ className = "", children, ...props }: BtnProps) {
  return (
    <button type="button" className={`${YEOUN_HOME_BTN_HALF_PRIMARY} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function FlowSecondaryHalf({ className = "", children, ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={`${YEOUN_HOME_BTN_HALF_SECONDARY} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
