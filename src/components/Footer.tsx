export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-8 mt-10">
      <div className="container mx-auto px-4 text-sm text-slate-500">
        © {new Date().getFullYear()} Hotelio. All rights reserved.
      </div>
    </footer>
  )
}
