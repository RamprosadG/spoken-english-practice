export function AdminRegisterHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Admin Registration
      </h1>
      <p className="text-sm text-slate-500">
        Create an administrator account with the private admin secret key. This
        page is intentionally not linked from the app navigation.
      </p>
    </div>
  );
}
