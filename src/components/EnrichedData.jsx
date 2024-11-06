import React from 'react';

const EnrichedData = ({ enrichedData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Enriched Company Data</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(enrichedData).map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <p className="text-sm font-medium text-gray-500">{key}</p>
            <p className="mt-1">{typeof value === 'object' ? JSON.stringify(value) : value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnrichedData;