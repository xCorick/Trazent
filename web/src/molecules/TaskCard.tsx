import { CalendarOutlined, EnvironmentOutlined, PictureOutlined, RightOutlined } from '@ant-design/icons';
import { TaskStatusTag, UserAvatar } from '@/atoms';
import type { Task } from '@/types';
import { formatDue } from '@/utils/format';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showAssignee?: boolean;
}

export function TaskCard({ task, onClick, showAssignee = false }: TaskCardProps) {
  const content = (
    <>
      <div className="tz-task-card__top">
        <TaskStatusTag status={task.status} />
        {onClick && <RightOutlined className="tz-task-card__chevron" />}
      </div>
      <div className="tz-task-card__title">{task.title}</div>
      <div className="tz-task-card__meta">
        <span>
          <EnvironmentOutlined /> {task.siteName}
        </span>
        <span>
          <CalendarOutlined /> {formatDue(task.dueAt)}
        </span>
        <span>
          <PictureOutlined /> {task.evidenceCount} {task.evidenceCount === 1 ? 'evidencia' : 'evidencias'}
        </span>
      </div>
      {showAssignee && (
        <div className="tz-task-card__assignee">
          <UserAvatar name={task.assignedToName} size={26} />
          <span>{task.assignedToName}</span>
        </div>
      )}
    </>
  );

  if (!onClick) return <div className="tz-task-card">{content}</div>;

  return (
    <button type="button" className="tz-task-card tz-task-card--clickable" onClick={onClick}>
      {content}
    </button>
  );
}
