export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="#" className="text-neutral-600 hover:text-neutral-900">
              About
            </a>
            <a href="#" className="text-neutral-600 hover:text-neutral-900">
              Help
            </a>
            <a href="#" className="text-neutral-600 hover:text-neutral-900">
              Privacy
            </a>
            <a href="#" className="text-neutral-600 hover:text-neutral-900">
              Terms
            </a>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-neutral-500 md:text-right">
              &copy; {new Date().getFullYear()} SyllabusCheck. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
