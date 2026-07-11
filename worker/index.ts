/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event: PushEvent) => {
  try {
    const data = event.data?.json() as {
      title?: string;
      body?: string;
      url?: string;
    };

    const title = data?.title || "Habit Tracker";
    const body = data?.body || "Check your progress";

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: "/pwa-icons/icon-192",
        badge: "/pwa-icons/icon-192",
        data: {
          url: data?.url || "/",
        },
      }),
    );
  } catch (error) {
    console.error("Error handling push event:", error);
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const url = (event.notification.data?.url as string) || "/";

  event.waitUntil(
    (self.clients as Clients)
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList: readonly Client[]) => {
        // Look for an existing client at the target origin
        for (const client of clientList) {
          if (
            client.url === url ||
            (client.url.startsWith(self.location.origin) &&
              url.startsWith("/"))
          ) {
            return (client as WindowClient).focus();
          }
        }
        // If no matching client, open a new window
        if ((self.clients as Clients).openWindow) {
          return (self.clients as Clients).openWindow(url);
        }
      }),
  );
});

export {};
