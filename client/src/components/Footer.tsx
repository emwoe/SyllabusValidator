export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6"></div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-neutral-500 md:text-right">
              &copy; {new Date().getFullYear()} SEU Gen Ed Syllabus Checker. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
