import React from 'react';
import { X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { cx } from 'classix';
import { useStatusStore, StatusMessage } from '../store/statusStore';

const StatusIcon: React.FC<{ type: StatusMessage['type'] }> = ({ type }) => {
  switch (type) {
    case 'error':
      return <AlertTriangle size={16} className="text-danger" />;
    case 'success':
      return <CheckCircle size={16} className="text-success" />;
    case 'loading':
      return <div className="progress-spinner w-4 h-4 border-2 rounded-full animate-spin border-app-border border-t-brand-accent-600" />;
    default:
      return <Info size={16} className="text-info" />;
  }
};

const StatusToast: React.FC<{ message: StatusMessage; onDismiss: (id: string) => void }> = ({ message, onDismiss }) => {
  return (
    <div
      className={cx(
        'status-alert',
        'bg-app-panel border-app-border'
      )}
      role="alert"
    >
      <StatusIcon type={message.type} />
      <span className="status-message flex-1 text-sm text-app-fg">{message.message}</span>
      <button 
        onClick={() => onDismiss(message.id)} 
        className="p-1 rounded-full hover:bg-app-bg transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const StatusBarContainer: React.FC = () => {
  const { messages, removeMessage } = useStatusStore();

  return (
    <div className="fixed bottom-12 right-4 z-40 flex flex-col items-end gap-2">
      {messages.map((msg) => (
        <StatusToast key={msg.id} message={msg} onDismiss={removeMessage} />
      ))}
    </div>
  );
};
