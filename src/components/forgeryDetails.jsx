// src/pages/ForgeryDetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useSelector } from "react-redux";
import SERVER_IP from "../serverIP";

export const ForgeryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const forgeries=useSelector((state)=>state.reducerX.dynamicData.forgeries);

const forgery=forgeries.find((forgery)=>forgery.id==id);

  /* Dummy record for example
  const forgery = {
    id,
    name: "John Doe",
    msisdn: "256700123456",
    timestamp: "2025-09-01 10:45",
    images: ["/sample1.png", "/sample2.png"],
    attempts: [
      {
        attemptId: 1,
        timestamp: "2025-09-01 09:30",
        changed: ["Image"],
        constant: ["MSISDN", "Name"],
      },
      {
        attemptId: 2,
        timestamp: "2025-09-01 10:45",
        changed: ["MSISDN"],
        constant: ["Name"],
      },
    ],
  };
  */

  return (
    <div className="p-4">
      {/* Back Button left aligned */}
      <div className="mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="bg-red-900 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ← Back
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-900 mb-4">
          Forgery Details
        </h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <strong className="text-gray-900">Name:</strong> {(forgery.name).includes('=') ? forgery.name.slice(0,forgery.name.indexOf('=')).replace(/\|/g," "):forgery.name.split('|')}
          </p>
          <p>
            <strong className="text-gray-900">MSISDN:</strong> {forgery.msisdn}
          </p>
          <p>
            <strong className="text-gray-900">First Recorded:</strong>{" "}
            {forgery.timeStamp}
          </p>
        </div>

        <h3 className="mt-6 text-lg font-semibold text-gray-800">Images</h3>
        <div className="flex gap-4 mt-3 grid grid-cols-3 flex-wrap">
          {forgery.images.map((img, i) => (
            <img
              key={i}
              src={SERVER_IP+img}
              alt={`Forgery ${i}`}
              className="w-200 h-100 object-cover rounded-lg border shadow-sm"
            />
          ))}
        </div>

        <h3 className="mt-8 text-lg font-semibold text-gray-800">Attempts</h3>
        <div className="mt-3 space-y-4">
          {forgery.attempts.map((a,i) => (
            <div
              key={a.attemptNo}
              className="border rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <p className="font-medium text-gray-900">
                Attempt #{a.attemptNo} -{" "}
                <span className="text-sm text-gray-500">{a.timeStamp}</span>
              </p>
              <p className="text-sm text-red-700 mt-1">
                <span className="font-semibold">Changed:</span>{" "}
                {a.changedProperty.join(", ") || "None"}
              </p>
              <p className="text-sm text-green-700">
                <span className="font-semibold">Constant:</span>{" "}
                {a.constantProperties.join(", ") || "None"}
              </p>

              <div id="images-array " className="grid mt-4 grid-cols-3 gap-2">
              {forgery.images.map((img, i) => (
            <img
              key={i}
              src={SERVER_IP+img}
              alt={`Forgery ${i}`}
              className="w-200 h-100 object-cover rounded-lg border shadow-sm"
            />
          ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
