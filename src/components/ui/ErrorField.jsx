function ErrorField({ error }) {
  if (!error) return null;

  return <span className="text-red-500 text-sm">{error.message}</span>;
}

export default ErrorField;
