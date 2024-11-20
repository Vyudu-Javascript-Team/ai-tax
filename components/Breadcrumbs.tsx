import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex space-x-2">
        <li>
          <Link href="/" className="text-blue-500 hover:underline">
            Home
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          return (
            <li key={segment}>
              <span className="text-gray-500 mx-2">/</span>
              {isLast ? (
                <span className="text-gray-700">{segment}</span>
              ) : (
                <Link href={href} className="text-blue-500 hover:underline">
                  {segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}