const MOCK_USER_NAME = "Caique";

const GREETING_TEMPLATES = [
  (name: string) => `Good to see you, ${name}`,
  (name: string) => `Welcome back, ${name}`,
  (name: string) => `Hey, ${name}`,
  (name: string) => `Let's keep going, ${name}`,
  (name: string) => `Ready for today, ${name}?`,
] as const;

function pickRandomGreeting(userName: string): string {
  const index = Math.floor(Math.random() * GREETING_TEMPLATES.length);
  return GREETING_TEMPLATES[index](userName);
}

interface HomeHeaderProps {
  userName?: string;
}

export function HomeHeader({ userName = MOCK_USER_NAME }: HomeHeaderProps) {
  const greeting = pickRandomGreeting(userName);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        {greeting}
      </h1>
      <p className="text-sm text-white/40">
        <span className="capitalize">{dateStr}</span>
        <span> · Every day counts</span>
      </p>
    </div>
  );
}
