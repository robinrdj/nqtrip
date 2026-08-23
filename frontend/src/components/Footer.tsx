export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>&copy; {new Date().getFullYear()} QTrip</span>
        <span>Plan it. Book it. Go.</span>
      </div>
    </footer>
  );
}
