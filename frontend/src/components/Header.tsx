'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, Settings, Home } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const getPageInfo = () => {
    switch (pathname) {
      case '/':
        return {
          title: 'Preben Prepper',
          subtitle: 'Keep track of your items and never let them expire'
        };
      case '/inventory':
        return {
          title: 'Preben Prepper',
          subtitle: 'Inventory'
        };
      case '/admin':
        return {
          title: 'Preben Prepper',
          subtitle: 'Management Dashboard'
        };
      default:
        return {
          title: 'Preben Prepper',
          subtitle: ''
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <header className="text-center md:text-left space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </header>
          
          <nav className="flex justify-center md:justify-end space-x-2">
            <Button
              variant={pathname === '/' ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              variant={pathname === '/inventory' ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href="/inventory">
                <Package className="h-4 w-4 mr-2" />
                Inventory
              </Link>
            </Button>
            <Button
              variant={pathname === '/admin' ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
