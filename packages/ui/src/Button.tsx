import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, ...other }: ButtonProps) => {
  return <button {...other}>{children}</button>;
};

Button.displayName = "Button";
