import React from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetTrigger,
    SheetContent,
} from '@/components/ui/sheet'

type Theme = 'light' | 'dark'

interface NavbarProps {
    theme: Theme
    setTheme: (theme: Theme) => void
}

export const Navbar: React.FC<NavbarProps> = ({ theme, setTheme }) => {
    const navLinks = [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'GitHub', to: 'https://github.com/thealakazam/file2fa', external: true },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">

                {/* Logo + Title */}
                <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
                    <img src="/file2fa/logo.svg" alt="File2FA" className="h-20 w-35 dark:invert" />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) =>
                        link.external ? (
                            <a
                                key={link.label}
                                href={link.to}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium hover:underline"
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.label}
                                to={link.to}
                                className="text-sm font-medium hover:underline"
                            >
                                {link.label}
                            </Link>
                        )
                    )}

                    {/* Help Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-sm font-medium">
                                Help
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link to="/help/file-formats">File Formats</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/help/errors">Common Errors</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/help/faq">FAQ</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </nav>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[260px] sm:w-[300px]">
                            <div className="mt-6 flex flex-col gap-4">
                                {navLinks.map((link) =>
                                    link.external ? (
                                        <a
                                            key={link.label}
                                            href={link.to}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            key={link.label}
                                            to={link.to}
                                            className="text-sm font-medium"
                                        >
                                            {link.label}
                                        </Link>
                                    )
                                )}

                                <div className="pt-4 text-sm font-semibold">Help</div>
                                <Link to="/help/file-formats" className="text-sm">File Formats</Link>
                                <Link to="/help/errors" className="text-sm">Common Errors</Link>
                                <Link to="/help/faq" className="text-sm">FAQ</Link>

                                <div className="pt-6">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    >
                                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
