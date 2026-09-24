import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";

import appCss from "../styles.css?url";
import { colors } from "#/tokens.stylex";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "ガラポンくじ",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      ...(import.meta.env.DEV ? [{ rel: "stylesheet", href: "/virtual:stylex.css" }] : []),
    ],
    headScripts: import.meta.env.DEV
      ? [{ type: "module", children: "import('virtual:stylex:runtime');" }]
      : [],
  }),
  shellComponent: RootDocument,
});

const styles = stylex.create({
  html: {
    height: "100%",
    margin: 0,
    overflow: "hidden",
    colorScheme: "light",
  },
  body: {
    height: "100%",
    margin: 0,
    overflow: "hidden",
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily:
      '"Hiragino Sans", "Yu Gothic UI", "Meiryo", system-ui, -apple-system, "Segoe UI", sans-serif',
    WebkitFontSmoothing: "antialiased",
    WebkitTapHighlightColor: "transparent",
    userSelect: "none",
    touchAction: "manipulation",
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" {...stylex.props(styles.html)}>
      <head>
        <HeadContent />
      </head>
      <body {...stylex.props(styles.body)}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
