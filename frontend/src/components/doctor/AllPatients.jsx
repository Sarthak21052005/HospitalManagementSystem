function AllPatients({ patients, onCreateReport }) {
  if (!patients || patients.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No patients registered yet</h3>
        <p className="text-gray-500">Patients will appear here once registered</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Registered Patients</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Total: {patients.length}
        </span>
      </div>

      <div className="grid gap-4">
        {patients.map((patient, index) => (
          <div
            key={patient.id || index}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {patient.name?.charAt(0) || patient.patientname?.charAt(0) || 'P'}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {patient.name || patient.patientname}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📋 ID: {patient.id || patient.patientid}</span>
                    <span>🎂 Age: {patient.age || 'N/A'}</span>
                    <span>⚧ {patient.gender || 'N/A'}</span>
                    <span>📞 {patient.contact || patient.contactno || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onCreateReport(patient)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-md"
              >
                Create Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllPatients;
