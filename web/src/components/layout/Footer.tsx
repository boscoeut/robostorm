import type { FooterProps } from '@/types/layout';

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              DataStorm
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprehensive Electric Vehicle Data Hub providing technical specifications, 
              performance data, and industry insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/vehicles" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Vehicle Database
                </a>
              </li>

              <li>
                <a 
                  href="/news" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Industry News
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider">
              Contact
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Email: info@datastorm.com</p>
              <p>Follow us for updates</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 DataStorm. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a 
                href="/privacy" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
