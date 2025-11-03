import React from "react";
import { Link } from "react-router-dom";
import { Topbar } from "../ui/topBar";
import { useSelector } from "react-redux";
import SERVER_IP from "../../serverIP";

/* Mock data
const forgeryHistory = [
  {
    id: 1,
    msisdn: "256700123456",
    name: "John Doe",
    timestamp: "2025-08-20 14:35",
    images: [
      "https://via.placeholder.com/120x120.png?text=Forgery+1a",
      "https://via.placeholder.com/120x120.png?text=Forgery+1b",
    ],
    attempts: [
      { attemptId: "A1", changes: ["name"], constants: ["msisdn"] },
      { attemptId: "A2", changes: ["msisdn"], constants: ["name"] },
    ],
  },
  {
    id: 2,
    msisdn: "256701987654",
    name: "Jane Smith",
    timestamp: "2025-08-28 10:15",
    images: ["https://via.placeholder.com/120x120.png?text=Forgery+2a"],
    attempts: [
      { attemptId: "B1", changes: ["image"], constants: ["name", "msisdn"] },
    ],
  },
];*/


export function PreviousForgeries() {
  const forgeryHistory=useSelector((state)=>state.reducerX.dynamicData.forgeries);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-red-900 mb-8">
          Previous Forgeries
        </h1>

        {forgeryHistory.length === 0 ? (
          <p className="text-gray-600 italic">No previous forgeries recorded.</p>
        ) : (
          <div className="grid gap-8">
            {forgeryHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 text-red-700">
                      {(item.name).includes('=') ? item.name.slice(0,item.name.indexOf('=')).replace(/\|/g," "):item.name.split('|')}
                    </h2>
                    <p className="text-sm text-gray-600 text-red-700 ">
                      <span className="font-medium">MSISDN:</span>{" "}
                      {item.msisdn}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 text-red-700">
                      {item.timestamp}
                    </p>
                  </div>
                  <Link
                    to={`/details/${item.id}`}
                    className="px-4 py-2 rounded-lg bg-red-900 text-white text-sm font-medium hover:bg-red-700 transition"
                  >
                    View Details
                  </Link>
                </div>

                {/* Images */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {item.images.map((img, i) => (
                    <img
                      key={i}
                      src={SERVER_IP+img}
                      alt={`Forgery ${item.id} - ${i}`}
                      className="w-28 h-28 object-cover rounded-lg border shadow-sm"
                    />
                  ))}
                </div>

                {/* Attempts */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Attempts ({item.attempts.length})
                  </h3>
                  <div className="space-y-3">
                    {item.attempts.map((a) => (
                      <div
                        key={a.attemptId}
                        className="p-3 rounded-lg border bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          Attempt <span className="text-red-800">{a.attemptNo}</span>
                        </p>
                        <div className="mt-2 sm:mt-0 text-xs space-x-4">
                          <span className="text-red-700">
                            Changed:{" "}
                            {a.changedProperty.length > 0
                              ? a.changedProperty.join(", ")
                              : "None"}
                          </span>
                          <span className="text-green-700">
                            Constant:{" "}
                            {a.constantProperties.length > 0
                              ? a.constantProperties.join(", ")
                              : "None"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
