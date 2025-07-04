import React from "react";

interface FormSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <section className="mb-8 bg-white rounded-2xl shadow p-6 border border-gray-200">
      <h2 className="text-2xl font-extrabold text-blue-700 mb-4 flex items-center gap-2">
        {icon && <span className="text-3xl">{icon}</span>}
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
} 