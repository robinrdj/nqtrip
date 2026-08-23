import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="status-block" role="status">
      <Spinner animation="border" variant="warning" />
      <p className="mt-3 mb-0 text-secondary">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Alert variant="danger" className="my-4">
      {message}
    </Alert>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Alert variant="dark" className="my-4">
      {children}
    </Alert>
  );
}
