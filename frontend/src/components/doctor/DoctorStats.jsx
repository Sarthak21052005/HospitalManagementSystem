function DoctorStats({ stats, onCardClick, activeView }) {
  const cards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: '👥',
      bgGradient: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      lightBg: 'bg-blue-50',
      view: 'patients'
    },
    {
      title: "Today's Patients",
      value: stats.todayAppointments,
      icon: '📅',
      bgGradient: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      lightBg: 'bg-green-50',
      view: 'schedule'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingAppointments,
      icon: '⏳',
      bgGradient: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      lightBg: 'bg-orange-50',
      view: 'appointments'
    },
    {
      title: 'Lab Reports',
      value: 'View',
      icon: '🧪',
      bgGradient: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      lightBg: 'bg-purple-50',
      view: 'lab_reports'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => onCardClick(card.view)}
          className={`
            relative overflow-hidden
            bg-white rounded-xl shadow-lg
            border-2 ${activeView === card.view ? 'border-blue-500' : 'border-transparent'}
            cursor-pointer
            transform transition-all duration-300 hover:scale-105 hover:shadow-xl
            group
          `}
        >
          {/* Card Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.lightBg} p-3 rounded-lg`}>
                <span className="text-3xl">{card.icon}</span>
              </div>
              {activeView === card.view && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full absolute"></div>
                </div>
              )}
            </div>
            
            <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
              {card.title}
            </h3>
            
            <p className={`text-4xl font-bold ${card.textColor}`}>
              {card.value}
            </p>
            
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span>Click to view details</span>
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Bottom Gradient Bar */}
          <div className={`h-1 bg-gradient-to-r ${card.bgGradient}`}></div>
        </div>
      ))}
    </div>
  );
}

export default DoctorStats;
