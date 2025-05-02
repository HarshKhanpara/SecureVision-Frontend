export const AlertsComponent = ({ alertLogs }) => (
    <div className="bg-gray-900/40 rounded-3xl p-6 shadow-xl h-full overflow-y-auto">
      <h2 className="text-white text-xl font-semibold mb-4">Alerts</h2>
      <div className="space-y-4">
        {alertLogs.length === 0 ? (
          <p className="text-gray-400">No alerts found.</p>
        ) : (
          alertLogs.map((log, index) => (
            <div
              key={index}
              className="p-4 border border-red-600 rounded-lg bg-red-900/10 text-red-300"
            >
              <p className="text-sm font-bold">{log.timestamp} - {log.user}</p>
              <p className="mt-1 text-sm">{log.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
  