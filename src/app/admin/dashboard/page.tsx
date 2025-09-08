export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Panel de administración</p>
      <nav>
        <ul>
          <li><a href="/admin/users">Usuarios</a></li>
          <li><a href="/admin/products">Productos</a></li>
          <li><a href="/admin/reports">Reportes</a></li>
        </ul>
      </nav>
    </div>
  );
}
