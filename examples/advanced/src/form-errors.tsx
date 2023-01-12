export const FormErrors = ({ errors }: { errors: React.ReactNode[] }) => (
  <div className="p-2 bg-neutral-900">
    {errors.map((error, idx) => (
      <div key={idx}>❗{error}</div>
    ))}
    {errors.length === 0 && "✅"}
  </div>
);
