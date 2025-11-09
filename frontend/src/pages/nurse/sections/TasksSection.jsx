import NurseTaskDashboard from '../../../components/nurse/NurseTaskDashboard';

function TasksSection({ user, onTaskUpdate }) {
  return (
    <NurseTaskDashboard 
      user={user} 
      onTaskUpdate={onTaskUpdate}
    />
  );
}

export default TasksSection;
