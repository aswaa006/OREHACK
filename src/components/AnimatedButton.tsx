import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "oauth";
  shimmer?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { padding: "0.5rem 1.25rem", fontSize: "0.8rem" },
  md: { padding: "0.75rem 1.75rem", fontSize: "0.875rem" },
  lg: { padding: "0.875rem 2.25rem", fontSize: "0.95rem" },
};

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = "primary",
  shimmer = false,
  fullWidth = false,
  size = "md",
  className = "",
  style,
  ...rest
}) => {
  const variantClass =
    variant === "primary" ? "ore-btn-primary" :
    variant === "ghost"   ? "ore-btn-ghost" :
    "ore-oauth-btn";

  const baseClass = variant === "oauth" ? "" : "ore-btn";
  const shimmerClass = shimmer && variant === "primary" ? "ore-btn-shimmer" : "";

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className={`${baseClass} ${variantClass} ${shimmerClass} ${className}`}
      style={{
        ...(fullWidth ? { width: "100%" } : {}),
        ...sizeMap[size],
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
