import { useQuery } from "@tanstack/react-query";

import { getHealth } from "../../api/get-health";
import "./styles.css";

export function HealthStatus() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });

  if (healthQuery.isPending) {
    return <p className="health-status">Connecting to your workspace…</p>;
  }

  if (healthQuery.isError) {
    return (
      <p className="health-status" role="alert" data-state="error">
        The service is not ready yet. Try again shortly.
      </p>
    );
  }

  return (
    <p className="health-status" data-state="ready">
      Application and database are ready.
    </p>
  );
}
