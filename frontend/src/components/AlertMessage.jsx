function AlertMessage({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      {message}
      {onClose && (
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          ×
        </button>
      )}
    </div>
  );
}

export default AlertMessage;
