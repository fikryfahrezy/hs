import { type ButtonHTMLAttributes } from "react";

import "./styles.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button type={type} data-variant={variant} {...props} />;
}
