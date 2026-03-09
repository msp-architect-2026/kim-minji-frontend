export default function Monitoring() {
  const grafanaUrl =
    "http://grafana.wafer.local:32088/d/efa86fd1d0c121a26444b636a3f509a8/kubernetes-compute-resources-cluster?orgId=1&kiosk=true";

  return (
    <div style={{ height: "calc(100vh - 72px)", display: "flex", flexDirection: "column" }}>
      <h2 style={{ padding: "0 0 16px 0", margin: 0, fontSize: 24, fontWeight: 600 }}>클러스터 모니터링</h2>
      <iframe
        src={grafanaUrl}
        style={{ flex: 1, border: "none", width: "100%", borderRadius: 12 }}
        title="Grafana Dashboard"
      />
    </div>
  );
}