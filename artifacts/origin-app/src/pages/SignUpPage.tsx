import { SignUp } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const appearance = {
  variables: {
    colorPrimary: "#c89838",
    colorForeground: "#4a3a24",
    colorMutedForeground: "#7a6040",
    colorDanger: "#9b3a2e",
    colorBackground: "#ece1c3",
    colorInput: "#e8dcc0",
    colorInputForeground: "#4a3a24",
    colorNeutral: "#a38a5a",
    fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
    borderRadius: "2px",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: {
      background: "#ece1c3",
      border: "1px solid rgba(163,138,90,0.5)",
      borderRadius: "4px",
      boxShadow: "0 4px 32px rgba(74,58,36,0.18), 0 1px 0 rgba(255,235,180,0.3)",
      width: "420px",
      maxWidth: "calc(100vw - 40px)",
      overflow: "hidden",
    },
    card: { boxShadow: "none", border: "none", background: "transparent", borderRadius: 0 },
    footer: { boxShadow: "none", border: "none", background: "transparent", borderRadius: 0 },
    headerTitle: { color: "#4a3a24", fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: "22px", fontWeight: 400, letterSpacing: "0.06em" },
    headerSubtitle: { color: "#7a6040", fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: "14px" },
    socialButtonsBlockButtonText: { color: "#4a3a24" },
    formFieldLabel: { color: "#6a5030", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" as const },
    footerActionLink: { color: "#c89838" },
    footerActionText: { color: "#7a6040" },
    dividerText: { color: "#a38a5a" },
    identityPreviewEditButton: { color: "#c89838" },
    formFieldSuccessText: { color: "#0a6b5e" },
    alertText: { color: "#4a3a24" },
    logoBox: { margin: "0 auto 12px" },
    logoImage: { height: "44px" },
    socialButtonsBlockButton: {
      background: "rgba(163,138,90,0.12)",
      border: "1px solid rgba(163,138,90,0.4)",
      color: "#4a3a24",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #c89838, #f2d27a, #c89838)",
      color: "#3a2a10",
      boxShadow: "0 2px 8px rgba(200,152,56,0.4)",
      border: "none",
    },
    formFieldInput: {
      background: "#e8dcc0",
      border: "1px solid rgba(163,138,90,0.5)",
      color: "#4a3a24",
    },
    footerAction: { background: "transparent" },
    dividerLine: { background: "rgba(163,138,90,0.35)" },
    alert: { background: "rgba(155,58,46,0.1)", border: "1px solid rgba(155,58,46,0.3)" },
    otpCodeFieldInput: { background: "#e8dcc0", border: "1px solid rgba(163,138,90,0.5)", color: "#4a3a24" },
    formFieldRow: { gap: "10px" },
    main: { padding: "24px" },
  },
};

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-page-backdrop" />
      <div className="auth-page-inner">
        <div className="auth-page-mark">THE · ORIGIN</div>
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          appearance={appearance}
          fallbackRedirectUrl={`${basePath}/`}
        />
      </div>
    </div>
  );
}
