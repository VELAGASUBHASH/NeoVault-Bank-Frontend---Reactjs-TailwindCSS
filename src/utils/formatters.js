export const formatCurrency = (amount, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const maskAccountNumber = (num) =>
    `•••• •••• ${String(num).slice(-4)}`;

export const truncate = (str, n = 30) =>
    str?.length > n ? str.slice(0, n) + "…" : str;