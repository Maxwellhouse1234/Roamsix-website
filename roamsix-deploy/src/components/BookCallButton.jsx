import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

export default function BookCallButton({
  calLink = "roamsix/30min",
  className = "",
  children = "Book a call",
}) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "roamsix-booking" });
      cal("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <button
      type="button"
      data-cal-namespace="roamsix-booking"
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      className={className}
    >
      {children}
    </button>
  );
}
