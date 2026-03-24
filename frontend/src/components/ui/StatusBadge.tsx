interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const classMap = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
  };
  return <span className={classMap[status]}>{status}</span>;
}
