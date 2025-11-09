function TodaySchedule({ schedule, onCreateReport }) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No patients scheduled for today</h3>
        <p className="text-gray-500">Your schedule is clear!</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
          {schedule.length} {schedule.length === 1 ? 'Patient' : 'Patients'}
        </span>
      </div>

      <div className="space-y-4">
        {schedule.map((patient, index) => (
          <div
            key={patient.id || index}
            className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {patient.name?.charAt(0) || patient.patientname?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patient.name || patient.patientname}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {patient.id || patient.patientid} | Age: {patient.age || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 ml-13 text-sm">
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <span className="ml-2 font-medium">{patient.gender || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <span className="ml-2 font-medium">{patient.contact || patient.contactno || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onCreateReport(patient)}
                className="ml-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
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

export default TodaySchedule;
