import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-paper)' }}>
      <Sidebar />
      <main className="flex-1 px-10 py-10 max-w-5xl">{children}</main>
    </div>
  );
}
