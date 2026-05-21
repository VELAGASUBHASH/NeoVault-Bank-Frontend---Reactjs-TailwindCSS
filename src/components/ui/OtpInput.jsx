import { useRef } from "react";

export default function OtpInput({ value, onChange, length = 6 }) {
    const refs = Array.from({ length }, () => useRef(null));

    const handleChange = (e, i) => {
        const v = e.target.value.replace(/\D/, "").slice(-1);
        const arr = value.split("");
        arr[i] = v;
        onChange(arr.join(""));
        if (v && i < length - 1) refs[i + 1].current?.focus();
    };

    const handleKeyDown = (e, i) => {
        if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1].current?.focus();
    };

    return (
        <div className="flex gap-3 justify-center">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={refs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-12 h-14 text-center text-xl font-bold font-mono bg-navy-900/50 border border-vault-border text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-navy-500/60 focus:border-navy-500/60 transition-all"
                />
            ))}
        </div>
    );
}