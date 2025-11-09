function PendingPatients({ appointments, onCreateReport }) {
  const pending = appointments?.filter(apt => !apt.has_report) || [];

  if (pending.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">All caught up!</h3>
        <p className="text-gray-500">No pending reports to complete</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Reports</h2>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
          {pending.length} Awaiting
        </span>
      </div>

      <div className="space-y-4">
        {pending.map((appointment, index) => (
          <div
            key={appointment.id || index}
            className="bg-gradient-to-r from-orange-50 to-white border-l-4 border-orange-500 p-5 rounded-r-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.patient_name || appointment.patientname}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Patient ID: {appointment.patient_id || appointment.patientid}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onCreateReport({ 
                  id: appointment.patient_id || appointment.patientid, 
                  name: appointment.patient_name || appointment.patientname,
                  ...appointment
                })}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
              >
                Create Report Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingPatients;
