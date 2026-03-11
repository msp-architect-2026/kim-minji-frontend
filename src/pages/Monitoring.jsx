export default function Monitoring() {
  const clusterUrl =
    "http://grafana.wafer.local:32088/d/efa86fd1d0c121a26444b636a3f509a8/kubernetes-compute-resources-cluster?orgId=1&kiosk=true";

  const appUrl =
    "http://grafana.wafer.local:32088/d/dffkf5s4tktmob/backend-ai?orgId=1&kiosk=true";

  const logUrl =
    "http://grafana.wafer.local:32088/d/dffnj57aiurcwc/logs?orgId=1&kiosk=true";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>클러스터 모니터링</h2>
      <iframe
        src={clusterUrl}
        style={{ border: "none", width: "100%", height: 500, borderRadius: 12 }}
        title="Cluster Dashboard"
      />
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>앱 메트릭</h2>
      <iframe
        src={appUrl}
        style={{ border: "none", width: "100%", height: 500, borderRadius: 12 }}
        title="App Dashboard"
      />
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>로그</h2>
      <iframe
        src={logUrl}
        style={{ border: "none", width: "100%", height: 500, borderRadius: 12 }}
        title="Log Dashboard"
      />
    </div>
  );
}