type EmailContent = {
  title: string;
  body: string;
  cta: string;
  url: string;
  footnote: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEmail({ title, body, cta, url, footnote }: EmailContent): string {
  return `<div style="background:#191919;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <div style="max-width:440px;margin:0 auto;background:#212121;border-radius:24px;padding:36px 32px;color:#EDE6DA">
    <h1 style="margin:0 0 12px;font-size:20px;line-height:28px;font-weight:600">${escapeHtml(title)}</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:25px">${escapeHtml(body)}</p>
    <a href="${escapeHtml(url)}" style="display:inline-block;background:#EDE6DA;color:#191919;border-radius:999px;padding:13px 28px;font-size:15px;font-weight:600;text-decoration:none">${escapeHtml(cta)}</a>
    <p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#A8A29A">${escapeHtml(footnote)}</p>
  </div>
</div>`;
}

export async function sendEmail(to: string, content: EmailContent): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  // Resend's shared sender only reaches the account owner; production sets EMAIL_FROM.
  const from =
    process.env.EMAIL_FROM ?? "Habit Tracker <onboarding@resend.dev>";
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: content.title,
      html: renderEmail(content),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the email with status ${response.status}`);
  }
}

export type EmailLocale = "en" | "pt";

export function localeFromRequest(request?: Request): EmailLocale {
  return request?.headers.get("accept-language")?.toLowerCase().startsWith("en")
    ? "en"
    : "pt";
}

export function verificationEmail(url: string, locale: EmailLocale): EmailContent {
  return locale === "en"
    ? {
        title: "Confirm your email",
        body: "Confirm this address to finish creating your Habit Tracker account.",
        cta: "Confirm email",
        url,
        footnote: "If you did not create this account, ignore this email.",
      }
    : {
        title: "Confirme seu email",
        body: "Confirme este endereço para concluir sua conta no Habit Tracker.",
        cta: "Confirmar email",
        url,
        footnote: "Se você não criou esta conta, ignore este email.",
      };
}

export function resetPasswordEmail(url: string, locale: EmailLocale): EmailContent {
  return locale === "en"
    ? {
        title: "Reset your password",
        body: "Use the button below to choose a new password. The link works for one hour.",
        cta: "Choose new password",
        url,
        footnote: "If you did not ask for this, ignore this email. Your password stays the same.",
      }
    : {
        title: "Redefina sua senha",
        body: "Use o botão abaixo para escolher uma nova senha. O link vale por uma hora.",
        cta: "Escolher nova senha",
        url,
        footnote: "Se você não pediu isso, ignore este email. Sua senha continua a mesma.",
      };
}

export function inviteEmail(url: string, locale: EmailLocale): EmailContent {
  return locale === "en"
    ? {
        title: "You are invited to Habit Tracker",
        body: "Create your account with this email address to start tracking your habits.",
        cta: "Create account",
        url,
        footnote: "The invite works for 14 days.",
      }
    : {
        title: "Você foi convidado para o Habit Tracker",
        body: "Crie sua conta com este email para começar a acompanhar seus hábitos.",
        cta: "Criar conta",
        url,
        footnote: "O convite vale por 14 dias.",
      };
}
