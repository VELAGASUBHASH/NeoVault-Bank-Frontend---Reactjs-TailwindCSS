const config = {
    ACTIVE:    { bg: "bg-green-500/20",  text: "text-green-400",  label: "Active" },
    FROZEN:    { bg: "bg-blue-500/20",   text: "text-blue-400",   label: "Frozen" },
    CLOSED:    { bg: "bg-red-500/20",    text: "text-red-400",    label: "Closed" },
    PENDING:   { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pending" },
    APPROVED:  { bg: "bg-green-500/20",  text: "text-green-400",  label: "Approved" },
    REJECTED:  { bg: "bg-red-500/20",    text: "text-red-400",    label: "Rejected" },
    SUCCESS:   { bg: "bg-green-500/20",  text: "text-green-400",  label: "Success" },
    FAILED:    { bg: "bg-red-500/20",    text: "text-red-400",    label: "Failed" },
    CREDIT:    { bg: "bg-emerald-500/20",text: "text-emerald-400",label: "Credit" },
    DEBIT:     { bg: "bg-orange-500/20", text: "text-orange-400", label: "Debit" },
};

export default function StatusBadge({ status }) {
    const c = config[status?.toUpperCase()] || { bg: "bg-gray-500/20", text: "text-gray-400", label: status };
    return (
        <span className={`status-badge ${c.bg} ${c.text}`}>{c.label}</span>
    );
}