import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, SerializeFrom } from "@remix-run/node";
import './global.css';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel:'preconnect', href:'https://fonts.googleapis.com' },
  { rel:'preconnect', href:"https://fonts.gstatic.com", crossOrigin:'use-credentials'},
  { rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Anton&family=Roboto+Mono&family=Black+Han+Sans&family=Black+Ops+One&display=swap'},
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
