import * as stylex from "@stylexjs/stylex";
import { colors } from "#/tokens.stylex";

export const button = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    paddingBlock: 0,
    paddingInline: 28,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 14,
    fontFamily: "inherit",
    fontSize: "1.05rem",
    fontWeight: 600,
    cursor: {
      default: "pointer",
      ":disabled": "default",
    },
    transitionProperty: "background, transform, opacity",
    transitionDuration: "0.15s, 0.1s, 0.15s",
    transform: {
      default: "none",
      ":active:not(:disabled)": "scale(0.98)",
    },
  },
  primary: {
    background: {
      default: colors.primary,
      ":active:not(:disabled)": "#3a4048",
    },
    color: "#fff",
    opacity: {
      default: 1,
      ":disabled": 0.35,
    },
  },
  secondary: {
    background: colors.surface,
    borderColor: colors.line,
    color: colors.text,
  },
  danger: {
    background: colors.surface,
    borderColor: "#f0c4c7",
    color: colors.danger,
  },
  dangerSolid: {
    background: colors.danger,
    borderColor: colors.danger,
    color: "#fff",
  },
  draw: {
    minWidth: 320,
    minHeight: {
      default: 88,
      "@media (max-height: 720px)": 72,
    },
    borderRadius: 20,
    fontSize: {
      default: "1.75rem",
      "@media (max-height: 720px)": "1.5rem",
    },
    letterSpacing: "0.08em",
  },
  result: {
    minWidth: 280,
    minHeight: 72,
    fontSize: "1.35rem",
  },
  flex: {
    flex: 1,
  },
});

export const iconButton = stylex.create({
  base: {
    display: "grid",
    placeItems: "center",
    width: 56,
    height: 56,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    borderRadius: 14,
    fontFamily: "inherit",
    cursor: {
      default: "pointer",
      ":disabled": "default",
    },
    background: {
      default: colors.surface,
      ":active:not(:disabled)": "#eceef1",
    },
    color: colors.textSoft,
    transitionProperty: "background",
    transitionDuration: "0.15s",
    opacity: {
      default: 1,
      ":disabled": 0.4,
    },
  },
});

export const stepperButton = stylex.create({
  base: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    borderRadius: 12,
    fontFamily: "inherit",
    fontSize: "1.4rem",
    color: colors.text,
    cursor: {
      default: "pointer",
      ":disabled": "default",
    },
    background: {
      default: colors.surface,
      ":active:not(:disabled)": "#eceef1",
    },
    opacity: {
      default: 1,
      ":disabled": 0.35,
    },
  },
});

export const dot = stylex.create({
  base: {
    display: "inline-block",
    flex: "none",
    width: 14,
    height: 14,
    borderRadius: "50%",
    boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.12)",
  },
  inTable: {
    marginRight: 10,
    verticalAlign: -1,
  },
});
