"use client";

export default function Spinner({ size = 16 }: { size?: number }) {
  const s = `${size}px`;
  return (
    <span
      aria-label="Loading"
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
      style={{ width: s, height: s }}
    />
  );
}


