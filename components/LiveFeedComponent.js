export const LiveFeedComponent = ({ ips, cctvNames }) => (
    <div className="bg-gray-900/40 rounded-3xl p-6 shadow-xl h-full overflow-y-auto">
      <h2 className="text-white text-xl font-semibold mb-4 flex items-center">
        <span className="bg-blue-600/20 rounded-lg p-2 mr-3">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 0H5a2 2 0 01-2-2V9a2 2 0 012-2h4a2 2 0 012 2v3a2 2 0 01-2 2z" /></svg>
        </span>
        Live Feed
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ips.map((ip, index) => (
          <div
            key={ip}
            className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-md flex flex-col items-center"
          >
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              {cctvNames[index] || `CCTV ${index + 1}`}
            </h3>
            <img
              src={ip}
              alt="Live CCTV Feed"
              className="rounded-xl border border-gray-700"
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                aspectRatio: "16/9",
                objectFit: "contain",
              }}
            />
            <p className="text-sm text-gray-400 mt-2 break-all">{ip}</p>
          </div>
        ))}
      </div>
    </div>
  );
  